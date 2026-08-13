const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin);

async function request(path, { getToken, headers, ...options } = {}) {
  const token = getToken ? await getToken() : null;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {})
      },
      ...options
    });
  } catch {
    const error = new Error('The account service is unavailable. Please try again shortly.');
    error.code = 'API_UNAVAILABLE';
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || data.error || 'Request failed.');
    error.code = data.error?.code;
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  billingStatus: (getToken) => request('/api/billing/status', { getToken }),
  checkout: (getToken, plan, billingInterval) => request('/api/billing/checkout', {
    getToken,
    method: 'POST',
    body: JSON.stringify({ plan, billingInterval })
  }),
  portal: (getToken) => request('/api/billing/portal', { getToken, method: 'POST' })
};
