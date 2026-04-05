/**
 * Tiện ích vai trò — đồng bộ với schema role.name (ADMIN | MODERATOR | USER)
 */

/** Luôn trả 'ADMIN' | 'MODERATOR' | 'USER' | null — dùng thống nhất cho phân quyền */
function getRoleName(user) {
  if (!user) return null;
  let raw = null;
  if (typeof user.role === 'string') {
    raw = user.role;
  } else if (user.role && typeof user.role === 'object' && user.role.name != null) {
    raw = user.role.name;
  }
  if (raw == null || raw === '') return null;
  return String(raw).toUpperCase().trim();
}

function isStaff(user) {
  const r = getRoleName(user);
  return r === 'ADMIN' || r === 'MODERATOR';
}

module.exports = {
  getRoleName,
  isStaff,
};
