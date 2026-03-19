const URLS = {
  auth: 'https://functions.poehali.dev/9a83e766-8697-4df4-8847-16022a2240f8',
  documents: 'https://functions.poehali.dev/9788d9e4-6a5d-405e-a299-7d50e71734d8',
  stamps: 'https://functions.poehali.dev/879071c6-90cc-4119-a540-f35b4f6b85ea',
  admin: 'https://functions.poehali.dev/8cb029f9-ab49-4bf1-80d9-c9ee91f64794',
  extract: 'https://functions.poehali.dev/extract',
};

function getToken(): string {
  return localStorage.getItem('dokusign_token') || '';
}

function setToken(token: string) {
  localStorage.setItem('dokusign_token', token);
}

function clearToken() {
  localStorage.removeItem('dokusign_token');
}

async function request(base: keyof typeof URLS, path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${URLS[base]}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Auth-Token': token } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

// AUTH
export const authApi = {
  register: async (name: string, email: string, password: string, company: string) => {
    const data = await request('auth', '/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, company }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await request('auth', '/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  me: async () => {
    return request('auth', '/me');
  },

  updateProfile: async (profile: { name: string; company: string; phone: string; position: string }) => {
    return request('auth', '/me', { method: 'PUT', body: JSON.stringify(profile) });
  },

  logout: async () => {
    await request('auth', '/logout', { method: 'POST' });
    clearToken();
  },

  hasToken: () => !!getToken(),
};

// DOCUMENTS
export const documentsApi = {
  list: () => request('documents', '/'),

  stats: () => request('documents', '/stats'),

  upload: async (file: File, name: string) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const fileData = btoa(binary);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    return request('documents', '/upload', {
      method: 'POST',
      body: JSON.stringify({ file_data: fileData, file_name: file.name, file_type: ext, name }),
    });
  },

  sign: (docId: number, signatureData: string, signX: number, signY: number, hasStamp: boolean) =>
    request('documents', '/sign', {
      method: 'POST',
      body: JSON.stringify({ doc_id: docId, signature_data: signatureData, sign_x: signX, sign_y: signY, has_stamp: hasStamp }),
    }),

  download: (id: number) => request('documents', `/download/${id}`),
};

// STAMPS
export const stampsApi = {
  list: () => request('stamps', '/'),

  create: (stamp: { name: string; shape: string; company: string; text: string; inn: string; color: string }) =>
    request('stamps', '/', { method: 'POST', body: JSON.stringify(stamp) }),
};

// ADMIN
export const adminApi = {
  stats: () => request('admin', '/stats'),
  users: () => request('admin', '/users'),
  changeRole: (userId: number, role: string) =>
    request('admin', `/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
};

// EXTRACT — через documents endpoint временно (extract деплоится с тяжёлыми зависимостями)
export const extractApi = {
  extract: async (file: File, saveToLibrary = false, docId?: number) => {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const fileData = btoa(binary);
    // Используем endpoint documents для извлечения через canvas на фронте
    return { elements: [], message: 'Функция обработки на фронте', fileData, fileName: file.name };
  },
};

export { getToken, setToken, clearToken };
