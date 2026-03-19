const AUTH_URL = 'https://functions.poehali.dev/9a83e766-8697-4df4-8847-16022a2240f8';
const DOCS_URL = 'https://functions.poehali.dev/9788d9e4-6a5d-405e-a299-7d50e71734d8';
const STAMPS_URL = 'https://functions.poehali.dev/879071c6-90cc-4119-a540-f35b4f6b85ea';
const UPLOAD_STAMP_URL = 'https://functions.poehali.dev/76a3544d-741c-4cf9-bb60-d55383d9b23d';
const CONVERTER_URL = 'https://functions.poehali.dev/41ae3bf6-8f34-4b8c-9057-8d2e5e8595e8';

// ─── Token storage ───────────────────────────────────────────────
export const getToken = (): string => localStorage.getItem('ds_token') || '';
export const setToken = (t: string) => localStorage.setItem('ds_token', t);
export const clearToken = () => localStorage.removeItem('ds_token');

// ─── Base fetch ──────────────────────────────────────────────────
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['X-Auth-Token'] = token;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Файл в base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // убираем data:...;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── AUTH API ────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  company?: string;
  phone?: string;
  position?: string;
}

export const authApi = {
  async register(name: string, email: string, password: string, company?: string): Promise<{ token: string; user: User }> {
    const data = await apiFetch(`${AUTH_URL}/?action=register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, company }),
    });
    setToken(data.token);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await apiFetch(`${AUTH_URL}/?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  async me(): Promise<User | null> {
    if (!getToken()) return null;
    try {
      const data = await apiFetch(`${AUTH_URL}/?action=me`);
      return data.user;
    } catch {
      clearToken();
      return null;
    }
  },

  async logout() {
    try { await apiFetch(`${AUTH_URL}/?action=logout`, { method: 'POST' }); } catch { /* ignore */ }
    clearToken();
  },

  async updateProfile(data: Partial<User>) {
    return apiFetch(`${AUTH_URL}/?action=update_profile`, { method: 'POST', body: JSON.stringify(data) });
  },

  async changePassword(old_password: string, new_password: string) {
    return apiFetch(`${AUTH_URL}/?action=change_password`, { method: 'POST', body: JSON.stringify({ old_password, new_password }) });
  },
};

// ─── DOCUMENTS API ───────────────────────────────────────────────
export interface Document {
  id: number;
  name: string;
  file_type: string;
  file_size: number;
  action: string;
  status: string;
  has_signature: boolean;
  has_stamp: boolean;
  created_at: string;
  updated_at: string;
}

export const documentsApi = {
  async list(): Promise<Document[]> {
    const data = await apiFetch(`${DOCS_URL}/documents`);
    return data.documents || [];
  },

  async upload(file: File, name: string): Promise<{ id: number; name: string; file_type: string; s3_url: string }> {
    const file_data = await fileToBase64(file);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    return apiFetch(`${DOCS_URL}/upload`, {
      method: 'POST',
      body: JSON.stringify({
        file_data,
        file_name: file.name,
        file_type: ext,
        name,
      }),
    });
  },

  async sign(doc_id: number, signature_data: string, sign_x: number, sign_y: number, has_stamp = false) {
    return apiFetch(`${DOCS_URL}/sign`, {
      method: 'POST',
      body: JSON.stringify({ doc_id, signature_data, sign_x, sign_y, has_stamp }),
    });
  },

  async download(doc_id: number): Promise<{ url: string; name: string }> {
    return apiFetch(`${DOCS_URL}/download/${doc_id}`);
  },

  async stats(): Promise<{ total: number; signed: number; stamped: number }> {
    return apiFetch(`${DOCS_URL}/stats`);
  },
};

// ─── STAMPS API ──────────────────────────────────────────────────
export interface Stamp {
  id: number;
  name?: string;
  shape: string;
  company: string;
  text: string;
  inn: string;
  color: string;
  is_library: boolean;
  created_at: string;
  image_url?: string | null;
}

export const stampsApi = {
  async list(): Promise<Stamp[]> {
    const data = await apiFetch(`${STAMPS_URL}/`);
    return [...(data.personal || []), ...(data.library || [])];
  },

  async create(stamp: Omit<Stamp, 'id' | 'created_at'>): Promise<{ id: number }> {
    return apiFetch(`${STAMPS_URL}/`, {
      method: 'POST',
      body: JSON.stringify(stamp),
    });
  },

  async uploadFile(file: File): Promise<{ id: number; image_url: string; name: string }> {
    const file_data = await fileToBase64(file);
    return apiFetch(`${UPLOAD_STAMP_URL}/`, {
      method: 'POST',
      body: JSON.stringify({ file_data, file_name: file.name, file_type: file.type, name: file.name }),
    });
  },

  async delete(id: number) {
    return apiFetch(`${STAMPS_URL}/${id}`, { method: 'DELETE' });
  },
};

// ─── CONVERTER API ───────────────────────────────────────────────
export interface ConvertResult {
  ok: boolean;
  file_data: string;
  file_name: string;
  file_mime: string;
  orig_size: number;
  result_size: number;
  download_url: string;
}

export const converterApi = {
  async convert(
    file: File,
    from_fmt: string,
    to_fmt: string,
    quality = 90
  ): Promise<ConvertResult> {
    const file_data = await fileToBase64(file);
    return apiFetch(`${CONVERTER_URL}/`, {
      method: 'POST',
      body: JSON.stringify({
        file_data,
        file_name: file.name,
        from_fmt,
        to_fmt,
        quality,
      }),
    });
  },

  downloadFromBase64(b64: string, filename: string, mime: string) {
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};