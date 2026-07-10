const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Request failed.');
    error.code = data.error?.code;
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  me: () => request('/api/auth/me'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email, password) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  oauthUrl: (provider) => `${API_URL}/api/auth/oauth/${provider}`,
  registerBook: (book) => request('/api/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id, progress) => request(`/api/books/${id}`, { method: 'PATCH', body: JSON.stringify(progress) }),
  deleteBook: (id) => request(`/api/books/${id}`, { method: 'DELETE' }),
  checkout: () => request('/api/billing/checkout', { method: 'POST' })
};
