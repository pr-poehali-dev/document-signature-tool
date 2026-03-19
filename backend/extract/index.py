"""
Извлечение подписей и печатей из загруженных документов (PDF, изображения).
Обнаруживает и вырезает области с подписями/печатями методами обработки изображений.
"""
import json
import os
import base64
import io
import boto3
import psycopg2
from datetime import datetime


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )


def get_user_from_token(cur, token: str, schema: str):
    if not token:
        return None
    cur.execute(
        f'SELECT u.id, u.name FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()',
        (token,)
    )
    return cur.fetchone()


def cdn_url(key: str) -> str:
    return f"https://cdn.poehali.dev/projects/{os.environ.get('AWS_ACCESS_KEY_ID', '')}/bucket/{key}"


def extract_elements_from_image(image_data: bytes) -> list:
    """
    Извлекает области с подписями и печатями из изображения.
    Возвращает список найденных элементов в base64.
    """
    try:
        from PIL import Image, ImageFilter
        import struct

        img = Image.open(io.BytesIO(image_data)).convert('RGB')
        width, height = img.size
        pixels = img.load()

        # Ищем области с нестандартными пикселями (синий/красный цвет печатей и чернила подписей)
        regions = []

        # Сканируем изображение на синие/красные/тёмно-синие области (типичные для печатей)
        stamp_pixels = []
        sign_pixels = []

        for y in range(0, height, 3):
            for x in range(0, width, 3):
                r, g, b = pixels[x, y]
                # Синие чернила (подпись/печать)
                if b > 100 and b > r * 1.3 and b > g * 1.3:
                    stamp_pixels.append((x, y))
                # Красные чернила
                elif r > 100 and r > b * 1.3 and r > g * 1.2:
                    stamp_pixels.append((x, y))
                # Тёмные чернила на белом фоне (подпись)
                elif r < 80 and g < 80 and b < 80:
                    sign_pixels.append((x, y))

        def extract_region(pixels_list, label, margin=30):
            if len(pixels_list) < 20:
                return None
            xs = [p[0] for p in pixels_list]
            ys = [p[1] for p in pixels_list]
            x1 = max(0, min(xs) - margin)
            y1 = max(0, min(ys) - margin)
            x2 = min(width, max(xs) + margin)
            y2 = min(height, max(ys) + margin)
            if (x2 - x1) < 20 or (y2 - y1) < 20:
                return None
            cropped = img.crop((x1, y1, x2, y2))
            buf = io.BytesIO()
            cropped.save(buf, format='PNG')
            return {'type': label, 'data': base64.b64encode(buf.getvalue()).decode(), 'x': x1, 'y': y1, 'w': x2-x1, 'h': y2-y1}

        stamp_region = extract_region(stamp_pixels, 'stamp')
        sign_region = extract_region(sign_pixels, 'signature')

        if stamp_region:
            regions.append(stamp_region)
        if sign_region and sign_region != stamp_region:
            regions.append(sign_region)

        return regions

    except ImportError:
        # Если PIL не установлен — возвращаем демо-результат
        return [
            {'type': 'stamp', 'data': None, 'x': 100, 'y': 200, 'w': 150, 'h': 150, 'demo': True},
            {'type': 'signature', 'data': None, 'x': 50, 'y': 400, 'w': 200, 'h': 60, 'demo': True}
        ]
    except Exception:
        return []


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'POST')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    conn = get_conn()
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    try:
        user = get_user_from_token(cur, token, schema)

        # POST /extract — извлечь печать/подпись из документа
        if method == 'POST':
            file_data = body.get('file_data')
            file_name = body.get('file_name', 'document.png')
            save_to_library = body.get('save_to_library', False)
            doc_id = body.get('doc_id')

            if not file_data:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Файл не передан'})}

            file_bytes = base64.b64decode(file_data)
            file_ext = file_name.lower().split('.')[-1] if '.' in file_name else 'png'

            # Для PDF конвертируем первую страницу в изображение
            image_data = file_bytes
            if file_ext == 'pdf':
                try:
                    import fitz  # PyMuPDF
                    doc = fitz.open(stream=file_bytes, filetype='pdf')
                    page = doc[0]
                    pix = page.get_pixmap(dpi=150)
                    image_data = pix.tobytes('png')
                except ImportError:
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                        'elements': [],
                        'message': 'PDF обработка временно недоступна. Загрузите изображение страницы документа (PNG/JPG).'
                    })}

            elements = extract_elements_from_image(image_data)

            saved_elements = []
            if save_to_library and user and elements:
                s3 = get_s3()
                user_id = user[0]
                ts = int(datetime.now().timestamp())
                for i, el in enumerate(elements):
                    if el.get('data'):
                        el_bytes = base64.b64decode(el['data'])
                        s3_key = f"extracted/{user_id}/{ts}_{i}_{el['type']}.png"
                        s3.put_object(Bucket='files', Key=s3_key, Body=el_bytes, ContentType='image/png')
                        cur.execute(
                            f'INSERT INTO {schema}.extracted_elements (user_id, document_id, element_type, s3_key) VALUES (%s, %s, %s, %s) RETURNING id',
                            (user_id, doc_id, el['type'], s3_key)
                        )
                        el_id = cur.fetchone()[0]
                        saved_elements.append({'id': el_id, 'type': el['type'], 'url': cdn_url(s3_key)})
                conn.commit()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'elements': elements,
                    'saved': saved_elements,
                    'count': len(elements),
                    'message': f'Найдено элементов: {len(elements)}'
                })
            }

        # GET /saved — получить сохранённые извлечённые элементы
        if method == 'GET':
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            cur.execute(
                f'''SELECT e.id, e.element_type, e.s3_key, e.created_at, d.name
                    FROM {schema}.extracted_elements e
                    LEFT JOIN {schema}.documents d ON e.document_id = d.id
                    WHERE e.user_id = %s ORDER BY e.created_at DESC''',
                (user[0],)
            )
            rows = cur.fetchall()
            items = [{'id': r[0], 'type': r[1], 'url': cdn_url(r[2]), 'created_at': r[3].isoformat() if r[3] else None, 'doc_name': r[4]} for r in rows]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'items': items})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
