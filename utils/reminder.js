const timers = new Map();
let counter = 0;

function setReminder(userId, durationMs, text, client) {
  const id = ++counter;
  const timeout = setTimeout(() => {
    const user = client.users.cache.get(userId);
    if (user) user.send(`Reminder: ${text}`).catch(() => {});
    timers.delete(id);
  }, durationMs);

  timers.set(id, { userId, text, timeout });
  return id;
}

function cancelReminder(id) {
  const t = timers.get(id);
  if (!t) return false;
  clearTimeout(t.timeout);
  timers.delete(id);
  return true;
}

function userReminders(userId) {
  const result = [];
  for (const [id, r] of timers) {
    if (r.userId === userId) {
      const remaining = r.timeout._idleTimeout - (Date.now() - r.timeout._idleStart);
      result.push({ id, text: r.text, remaining: Math.max(0, remaining) });
    }
  }
  return result;
}

module.exports = { setReminder, cancelReminder, userReminders };