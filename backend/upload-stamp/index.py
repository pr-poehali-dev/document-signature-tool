"""
Загрузка файла печати на S3 и сохранение в библиотеку пользователя.
Принимает файл в base64, сохраняет на S3, создаёт запись в stamps с image_url.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_from_token(cur, token: str, schema: str):
    if not token:
        return None
    cur.execute(
        f"SELECT u.id, u.name, u.role FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id WHERE s.token = '{token}' AND s.expires_at > NOW()"
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    token = (event.get('headers') or {}).get('X-Auth-Token') or (event.get('headers') or {}).get('x-auth-token')

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    file_data_b64 = body.get('file_data')
    file_name = body.get('file_name', 'stamp.png')
    file_type = body.get('file_type', 'image/png')
    stamp_name = body.get('name', file_name)

    if not file_data_b64:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'file_data required'})}

    file_bytes = base64.b64decode(file_data_b64)

    ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'png'
    s3_key = f"stamps/{uuid.uuid4()}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    s3.put_object(Bucket='files', Key=s3_key, Body=file_bytes, ContentType=file_type)
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{s3_key}"

    conn = get_conn()
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    user = get_user_from_token(cur, token, schema)
    user_id = user[0] if user else None

    cur.execute(
        f"INSERT INTO {schema}.stamps (user_id, name, shape, company, text, inn, color, is_library, image_url) VALUES ({user_id or 'NULL'}, '{stamp_name}', 'image', '', '', '', '#000000', FALSE, '{cdn_url}') RETURNING id"
    )
    stamp_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'id': stamp_id, 'image_url': cdn_url, 'name': stamp_name})
    }
