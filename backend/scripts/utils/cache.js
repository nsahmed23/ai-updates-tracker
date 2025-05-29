// Simple in-memory cache for rate limiting and deduplication
const cache = new Map();

export function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (item.expiry < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
}

export function setCached(key, value, ttlSeconds = 3600) {
  cache.set(key, {
    value,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
}

export function clearCache() {
  cache.clear();
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (item.expiry < now) {
      cache.delete(key);
    }
  }
}, 60000); // Every minute 