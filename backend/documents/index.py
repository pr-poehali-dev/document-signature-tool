"""
Управление документами: загрузка, список, подписание, скачивание, история.
"""
import json
import os
import base64
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
    cur.execute(
        f'SELECT u.id, u.name, u.role FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()',
        (token,)
    )
    return cur.fetchone()


def cdn_url(key: str) -> str:
    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    return f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    conn = get_conn()
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    try:
        user = get_user_from_token(cur, token, schema) if token else None

        # GET / — список документов пользователя
        if method == 'GET' and (path.endswith('/documents') or path == '/'):
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user_id = user[0]
            cur.execute(
                f'''SELECT id, name, file_type, file_size, action, status, has_signature, has_stamp, created_at, updated_at
                    FROM {schema}.documents WHERE user_id = %s ORDER BY created_at DESC LIMIT 100''',
                (user_id,)
            )
            rows = cur.fetchall()
            docs = []
            for r in rows:
                docs.append({
                    'id': r[0], 'name': r[1], 'file_type': r[2], 'file_size': r[3],
                    'action': r[4], 'status': r[5], 'has_signature': r[6], 'has_stamp': r[7],
                    'created_at': r[8].isoformat() if r[8] else None,
                    'updated_at': r[9].isoformat() if r[9] else None
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'documents': docs})}

        # POST /upload — загрузка документа
        if method == 'POST' and path.endswith('/upload'):
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user_id = user[0]
            file_data = body.get('file_data')
            file_name = body.get('file_name', 'document')
            file_type = body.get('file_type', 'pdf').upper()
            doc_name = body.get('name', file_name)

            if not file_data:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Файл не передан'})}

            file_bytes = base64.b64decode(file_data)
            file_size = len(file_bytes)
            ts = int(datetime.now().timestamp())
            s3_key = f"documents/{user_id}/{ts}_{file_name}"

            content_types = {'PDF': 'application/pdf', 'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'XLSX': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'PNG': 'image/png', 'JPG': 'image/jpeg', 'JPEG': 'image/jpeg'}
            content_type = content_types.get(file_type, 'application/octet-stream')

            s3 = get_s3()
            s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes, ContentType=content_type)

            cur.execute(
                f'''INSERT INTO {schema}.documents (user_id, name, file_type, file_size, s3_key, action, status)
                    VALUES (%s, %s, %s, %s, %s, 'uploaded', 'pending') RETURNING id''',
                (user_id, doc_name, file_type, file_size, s3_key)
            )
            doc_id = cur.fetchone()[0]
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': doc_id, 'name': doc_name, 'file_type': file_type, 'file_size': file_size, 's3_url': cdn_url(s3_key)})
            }

        # POST /sign — сохранить подписанный документ
        if method == 'POST' and path.endswith('/sign'):
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user_id = user[0]
            doc_id = body.get('doc_id')
            signature_data = body.get('signature_data')
            sign_x = body.get('sign_x', 0)
            sign_y = body.get('sign_y', 0)
            has_stamp = body.get('has_stamp', False)

            cur.execute(f'SELECT id, s3_key, name FROM {schema}.documents WHERE id = %s AND user_id = %s', (doc_id, user_id))
            doc = cur.fetchone()
            if not doc:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Документ не найден'})}

            cur.execute(
                f'''UPDATE {schema}.documents SET status='signed', has_signature=TRUE, has_stamp=%s, sign_x=%s, sign_y=%s, action='signed', updated_at=NOW()
                    WHERE id = %s''',
                (has_stamp, sign_x, sign_y, doc_id)
            )
            if signature_data:
                cur.execute(
                    f'INSERT INTO {schema}.signatures (user_id, name, type, data) VALUES (%s, %s, %s, %s)',
                    (user_id, 'Подпись документа', 'draw', signature_data)
                )
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'doc_id': doc_id})}

        # GET /download/{id} — скачать документ
        if method == 'GET' and '/download/' in path:
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            doc_id = int(path.split('/download/')[-1])
            cur.execute(f'SELECT s3_key, signed_s3_key, name FROM {schema}.documents WHERE id = %s AND user_id = %s', (doc_id, user[0]))
            doc = cur.fetchone()
            if not doc:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Не найден'})}
            key = doc[1] if doc[1] else doc[0]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'url': cdn_url(key), 'name': doc[2]})}

        # GET /stats — статистика для дашборда
        if method == 'GET' and path.endswith('/stats'):
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user_id = user[0]
            cur.execute(f'SELECT COUNT(*) FROM {schema}.documents WHERE user_id = %s', (user_id,))
            total = cur.fetchone()[0]
            cur.execute(f'SELECT COUNT(*) FROM {schema}.documents WHERE user_id = %s AND has_signature = TRUE', (user_id,))
            signed = cur.fetchone()[0]
            cur.execute(f'SELECT COUNT(*) FROM {schema}.documents WHERE user_id = %s AND has_stamp = TRUE', (user_id,))
            stamped = cur.fetchone()[0]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'total': total, 'signed': signed, 'stamped': stamped})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
