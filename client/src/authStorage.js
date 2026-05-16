export const AUTH_USER_KEY = "smart-campus-user";

export function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && (u._id || u.email) ? u : null;
  } catch {
    return null;
  }
}

export function writeStoredUser(user) {
  try {
    if (user && (user._id || user.email)) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    /* ignore */
  }
}
