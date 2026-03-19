"""
Аутентификация пользователей: регистрация, вход, выход, проверка сессии.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Content-Type': 'application/json'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor()
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    try:
        # POST /register
        if method == 'POST' and path.endswith('/register'):
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            company = body.get('company', '')

            if not name or not email or not password:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Заполните все поля'})}

            cur.execute(f'SELECT id FROM {schema}.users WHERE email = %s', (email,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}

            password_hash = hash_password(password)
            cur.execute(
                f'INSERT INTO {schema}.users (name, email, password_hash, company) VALUES (%s, %s, %s, %s) RETURNING id, name, email, role',
                (name, email, password_hash, company)
            )
            user = cur.fetchone()
            token = secrets.token_hex(32)
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                f'INSERT INTO {schema}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)',
                (user[0], token, expires_at)
            )
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'token': token, 'user': {'id': user[0], 'name': user[1], 'email': user[2], 'role': user[3]}})
            }

        # POST /login
        if method == 'POST' and path.endswith('/login'):
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            password_hash = hash_password(password)

            cur.execute(f'SELECT id, name, email, role FROM {schema}.users WHERE email = %s AND password_hash = %s', (email, password_hash))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            token = secrets.token_hex(32)
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(f'INSERT INTO {schema}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)', (user[0], token, expires_at))
            cur.execute(f'UPDATE {schema}.users SET last_login = NOW() WHERE id = %s', (user[0],))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'token': token, 'user': {'id': user[0], 'name': user[1], 'email': user[2], 'role': user[3]}})
            }

        # GET /me — проверка токена
        if method == 'GET' and path.endswith('/me'):
            token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            if not token:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Токен не передан'})}
            cur.execute(
                f'''SELECT u.id, u.name, u.email, u.role, u.company, u.phone, u.position
                    FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id
                    WHERE s.token = %s AND s.expires_at > NOW()''',
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Сессия истекла'})}
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'user': {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3], 'company': row[4], 'phone': row[5], 'position': row[6]}})
            }

        # PUT /me — обновление профиля
        if method == 'PUT' and path.endswith('/me'):
            token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            cur.execute(f'SELECT user_id FROM {schema}.sessions WHERE token = %s AND expires_at > NOW()', (token,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            user_id = row[0]
            name = body.get('name')
            company = body.get('company')
            phone = body.get('phone')
            position = body.get('position')
            cur.execute(
                f'UPDATE {schema}.users SET name=%s, company=%s, phone=%s, position=%s WHERE id=%s',
                (name, company, phone, position, user_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        # POST /logout
        if method == 'POST' and path.endswith('/logout'):
            token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
            if token:
                cur.execute(f'UPDATE {schema}.sessions SET expires_at = NOW() WHERE token = %s', (token,))
                conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
