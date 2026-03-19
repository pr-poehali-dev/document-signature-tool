"""
Панель администратора: управление пользователями, статистика системы.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_admin_from_token(cur, token: str, schema: str):
    if not token:
        return None
    cur.execute(
        f'SELECT u.id, u.role FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()',
        (token,)
    )
    row = cur.fetchone()
    if row and row[1] == 'admin':
        return row
    return None


def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
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
        admin = get_admin_from_token(cur, token, schema)
        if not admin:
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Доступ запрещён'})}

        # GET /users — список пользователей
        if method == 'GET' and path.endswith('/users'):
            cur.execute(f'SELECT id, name, email, role, company, created_at, last_login FROM {schema}.users ORDER BY created_at DESC')
            rows = cur.fetchall()
            users = []
            for r in rows:
                cur.execute(f'SELECT COUNT(*) FROM {schema}.documents WHERE user_id = %s', (r[0],))
                doc_count = cur.fetchone()[0]
                users.append({
                    'id': r[0], 'name': r[1], 'email': r[2], 'role': r[3], 'company': r[4],
                    'joined': r[5].strftime('%d %b %Y') if r[5] else '',
                    'last_login': r[6].strftime('%d %b %Y') if r[6] else 'Никогда',
                    'docs': doc_count,
                    'status': 'active'
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'users': users})}

        # GET /stats — общая статистика
        if method == 'GET' and (path.endswith('/stats') or path == '/'):
            cur.execute(f'SELECT COUNT(*) FROM {schema}.users')
            total_users = cur.fetchone()[0]
            cur.execute(f'SELECT COUNT(*) FROM {schema}.documents')
            total_docs = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {schema}.documents WHERE created_at > NOW() - INTERVAL '1 day'")
            today_docs = cur.fetchone()[0]
            cur.execute(f'SELECT COUNT(*) FROM {schema}.stamps WHERE is_library = FALSE')
            custom_stamps = cur.fetchone()[0]
            cur.execute(f"SELECT COUNT(*) FROM {schema}.sessions WHERE expires_at > NOW() AND created_at > NOW() - INTERVAL '1 hour'")
            active_sessions = cur.fetchone()[0]

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'total_users': total_users,
                    'total_docs': total_docs,
                    'today_docs': today_docs,
                    'custom_stamps': custom_stamps,
                    'active_sessions': active_sessions
                })
            }

        # PUT /users/{id}/role — сменить роль
        if method == 'PUT' and '/users/' in path and '/role' in path:
            parts = path.split('/')
            user_id = int([p for p in parts if p.isdigit()][0])
            new_role = body.get('role', 'user')
            cur.execute(f'UPDATE {schema}.users SET role = %s WHERE id = %s', (new_role, user_id))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
