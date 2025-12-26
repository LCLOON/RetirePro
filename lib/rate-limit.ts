// Simple in-memory rate limiter for API routes
// For production, consider using Redis or Upstash

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Clean every minute

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  limit: number;    // Max requests per interval
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, limit: 20 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  // Get or create entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + config.interval,
    };
  }
  
  const entry = store[key];
  entry.count++;
  
  const remaining = Math.max(0, config.limit - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);
  
  return {
    success: entry.count <= config.limit,
    remaining,
    resetIn,
  };
}

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  ai: { interval: 60000, limit: 10 },      // 10 AI requests per minute
  checkout: { interval: 60000, limit: 5 },  // 5 checkout attempts per minute
  email: { interval: 3600000, limit: 10 },  // 10 emails per hour
  general: { interval: 60000, limit: 60 },  // 60 requests per minute
};
