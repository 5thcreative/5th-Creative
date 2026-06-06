const hits = new Map();

const MAX = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);
const WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

function rateLimit(ip) {
  const now = Date.now();
  const record = hits.get(ip);

  if (!record || now - record.start > WINDOW) {
    hits.set(ip, { start: now, count: 1 });
    return { allowed: true, remaining: MAX - 1 };
  }

  record.count += 1;

  if (record.count > MAX) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((record.start + WINDOW - now) / 1000) };
  }

  return { allowed: true, remaining: MAX - record.count };
}

// Prune stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of hits) {
    if (now - record.start > WINDOW * 2) hits.delete(ip);
  }
}, 300_000).unref?.();

module.exports = { rateLimit };
