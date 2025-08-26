const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://api.ah2023.com/api';

async function request(path, { method = 'GET', body, headers, ...rest } = {}) {
  const opts = {
    method,
    credentials: 'include',               // send Cloudflare Access cookie cross-site
    headers: { 'Accept': 'application/json', ...headers },
    ...rest,
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);

  // Helpful error with payload if available
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.error) msg += ` — ${data.error}`;
    } catch { /* ignore parse fail */ }
    throw new Error(msg);
  }

  // Some endpoints might return no body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (p, options) => request(p, { ...options, method: 'GET' }),
  post: (p, body, options) => request(p, { ...options, method: 'POST', body }),
  put: (p, body, options) => request(p, { ...options, method: 'PUT', body }),
  del: (p, options) => request(p, { ...options, method: 'DELETE' }),
};
