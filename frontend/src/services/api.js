// Use environment variable for API URL, fallback to '/api' for development proxy
const API = import.meta.env.VITE_API_URL || '/api';

export async function uploadVoice(file, auditId, projectName) {
  const form = new FormData();
  form.append('audio', file);
  if (auditId) form.append('auditId', auditId);
  if (projectName) form.append('projectName', projectName);

  const res = await fetch(`${API}/upload/process`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function uploadMedia(files, auditId) {
  const form = new FormData();
  for (const f of files) form.append('media', f);
  if (auditId) form.append('auditId', auditId);

  const res = await fetch(`${API}/upload/media`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Media upload failed');
  }
  return res.json();
}

export async function uploadSnagText(text, projectName, auditId) {
  const res = await fetch(`${API}/upload/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      projectName,
      auditId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Text upload failed');
  }
  return res.json();
}

export async function getSnags(filters = {}) {
  const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''));
  const params = new URLSearchParams(clean);
  const res = await fetch(`${API}/snags?${params}`);
  if (!res.ok) throw new Error('Failed to fetch snags');
  return res.json();
}

export async function getSnagsByAudit(auditId) {
  const res = await fetch(`${API}/snags/audit/${auditId}`);
  if (!res.ok) throw new Error('Failed to fetch audit');
  return res.json();
}

export async function getSnag(id) {
  const res = await fetch(`${API}/snags/${id}`);
  if (!res.ok) throw new Error('Failed to fetch snag');
  return res.json();
}

export async function updateSnag(id, updates) {
  const res = await fetch(`${API}/snags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update snag');
  return res.json();
}

export async function attachMediaToSnag(snagId, mediaIds) {
  const res = await fetch(`${API}/snags/${snagId}/attach-media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mediaIds }),
  });
  if (!res.ok) throw new Error('Failed to attach media');
  return res.json();
}

export async function syncSnagToClickUp(snagId) {
  const res = await fetch(`${API}/clickup/sync/${snagId}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Sync failed');
  }
  return res.json();
}

export async function syncAuditToClickUp(auditId) {
  const res = await fetch(`${API}/clickup/sync-audit/${auditId}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Sync failed');
  }
  return res.json();
}
