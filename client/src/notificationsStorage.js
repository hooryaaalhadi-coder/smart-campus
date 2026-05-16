const prefix = (userId) =>
  `smart-campus-notification-read-ids:${userId || "guest"}`;

export function getReadNotificationIds(userId) {
  try {
    const raw = localStorage.getItem(prefix(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markNotificationIdRead(userId, id) {
  const set = getReadNotificationIds(userId);
  set.add(String(id));
  localStorage.setItem(prefix(userId), JSON.stringify([...set]));
}

export function markAllNotificationIdsRead(userId, ids) {
  const set = getReadNotificationIds(userId);
  ids.forEach((id) => set.add(String(id)));
  localStorage.setItem(prefix(userId), JSON.stringify([...set]));
}
