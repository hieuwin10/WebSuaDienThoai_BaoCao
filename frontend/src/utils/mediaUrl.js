/** Path tương đối (/api/v1/...) hoặc URL đầy đủ (https://...) */
export function mediaUrl(path, mediaBase) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(mediaBase || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function getMediaBase() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}
