"""
Управление печатями и штампами: библиотека, создание, сохранение.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_from_token(cur, token: str, schema: str):
    if not token:
        return None
    cur.execute(
        f'SELECT u.id, u.name, u.role FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()',
        (token,)
    )
    return cur.fetchone()


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
        user = get_user_from_token(cur, token, schema)

        # GET / — получить печати (библиотека + личные)
        if method == 'GET':
            cur.execute(
                f'''SELECT id, user_id, name, shape, company, text, inn, color, is_library, created_at
                    FROM {schema}.stamps WHERE is_library = TRUE ORDER BY id''',
            )
            library = cur.fetchall()

            personal = []
            if user:
                cur.execute(
                    f'''SELECT id, user_id, name, shape, company, text, inn, color, is_library, created_at
                        FROM {schema}.stamps WHERE user_id = %s AND is_library = FALSE ORDER BY created_at DESC''',
                    (user[0],)
                )
                personal = cur.fetchall()

            def row_to_dict(r):
                return {'id': r[0], 'user_id': r[1], 'name': r[2], 'shape': r[3], 'company': r[4],
                        'text': r[5], 'inn': r[6], 'color': r[7], 'is_library': r[8],
                        'created_at': r[9].isoformat() if r[9] else None}

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'library': [row_to_dict(r) for r in library], 'personal': [row_to_dict(r) for r in personal]})
            }

        # POST / — создать печать
        if method == 'POST':
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user_id = user[0]
            name = body.get('name', 'Новая печать')
            shape = body.get('shape', 'round')
            company = body.get('company', '')
            text = body.get('text', '')
            inn = body.get('inn', '')
            color = body.get('color', '#1a3a6e')
            save_to_library = body.get('save_to_library', False) and user[2] == 'admin'

            cur.execute(
                f'''INSERT INTO {schema}.stamps (user_id, name, shape, company, text, inn, color, is_library)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id''',
                (user_id, name, shape, company, text, inn, color, save_to_library)
            )
            stamp_id = cur.fetchone()[0]
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': stamp_id, 'name': name, 'shape': shape, 'company': company, 'text': text, 'inn': inn, 'color': color})
            }

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
