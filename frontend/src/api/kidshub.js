// frontend/src/api/kidshub.js
const API_BASE = import.meta.env.VITE_API_BASE || '';

function authHeaders() {
  const token = localStorage.getItem('kidshub_token') || '';
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function presign(childId, filename, contentType, size) {
  const res = await fetch(`${API_BASE}/api/${childId}/media/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ filename, contentType, size })
  });
  if (!res.ok) throw new Error('presign failed');
  return res.json(); // { uploadUrl, key }
}

export async function postMediaMeta(childId, meta) {
  const res = await fetch(`${API_BASE}/api/${childId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(meta)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('post meta failed: ' + text);
  }
  return res.json();
}

export async function listMedia(childId, opts={limit:20, offset:0}) {
  const q = new URLSearchParams({ limit: opts.limit, offset: opts.offset });
  const res = await fetch(`${API_BASE}/api/${childId}/media?${q.toString()}`, {
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('list media failed');
  return res.json();
}

export async function createBook(childId, payload) {
  const res = await fetch(`${API_BASE}/api/${childId}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('create book failed');
  return res.json();
}

export async function listBooks(childId) {
  const res = await fetch(`${API_BASE}/api/${childId}/books`, { headers: {...authHeaders()} });
  if(!res.ok) throw new Error('list books failed');
  return res.json();
}

export async function createActivity(childId, payload) {
  const res = await fetch(`${API_BASE}/api/${childId}/activities`, {
    method:'POST', headers: {'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('create activity failed');
  return res.json();
}

export async function listActivities(childId) {
  const res = await fetch(`${API_BASE}/api/${childId}/activities`, { headers: {...authHeaders()} });
  if(!res.ok) throw new Error('list activities failed');
  return res.json();
}

export async function createTrip(childId, payload) {
  const res = await fetch(`${API_BASE}/api/${childId}/trips`, {
    method:'POST', headers: {'Content-Type':'application/json', ...authHeaders()}, body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('create trip failed');
  return res.json();
}

export async function listTrips(childId) {
  const res = await fetch(`${API_BASE}/api/${childId}/trips`, { headers: {...authHeaders()} });
  if(!res.ok) throw new Error('list trips failed');
  return res.json();
}
