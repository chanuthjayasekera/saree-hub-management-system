const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

async function request(path, { method='GET', body=null, token=null, isForm=false } = {}){
  const headers = {};
  if(token) headers.Authorization = `Bearer ${token}`;

  if(body && !isForm){
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : null
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if(!res.ok){
    const msg = (data && data.message) ? data.message : `Request failed (${res.status})`;
    const err = new Error(msg);
    err.data = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    register: (payload) => request('/api/auth/register', { method:'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method:'POST', body: payload }),
  },
  users: {
    me: (token) => request('/api/users/me', { token }),
    updateMe: (payload, token) => request('/api/users/me', { method:'PUT', body: payload, token }),
  },
  sarees: {
    list: () => request('/api/sarees/all'),
    get: (id) => request(`/api/sarees/${id}`),
    create: (formData, token) => request('/api/sarees/add', { method:'POST', body: formData, token, isForm:true }),
    update: (id, formData, token) => request(`/api/sarees/update/${id}`, { method:'PUT', body: formData, token, isForm:true }),
    remove: (id, token) => request(`/api/sarees/delete/${id}`, { method:'DELETE', token }),
  },
  orders: {
    create: (payload, token) => request('/api/orders', { method:'POST', body: payload, token }),
    mine: (token) => request('/api/orders/mine', { token }),
    all: (token) => request('/api/orders/all', { token }),
    setStatus: (id, payload, token) => request(`/api/orders/${id}/status`, { method:'PUT', body: payload, token }),
  }
};

export { API_BASE };
