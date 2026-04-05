/**
 * Lấy thông báo lỗi từ response axios (JSON { message }, chuỗi, hoặc mảng validator).
 */
export function getApiErrorMessage(error, fallback = 'Đã có lỗi xảy ra.') {
  const d = error?.response?.data;
  if (d == null || d === '') return fallback;
  if (typeof d === 'string') return d.trim() || fallback;
  if (typeof d === 'object' && d.message != null && d.message !== '') {
    return String(d.message);
  }
  if (Array.isArray(d) && d.length > 0) {
    const first = d[0];
    if (first && typeof first === 'object') {
      const v = Object.values(first)[0];
      if (v != null && v !== '') return String(v);
    }
  }
  return fallback;
}
