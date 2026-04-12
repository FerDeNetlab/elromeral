/**
 * Rate limiting middleware for sensitive admin APIs
 * Usage: Apply to POST routes that require rate limiting
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number // milliseconds
}

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number }
}

// Simple in-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {}

/**
 * Rate limit middleware using IP address
 * @param config - Configuration object with maxRequests and windowMs
 * @returns Function that checks rate limit
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { maxRequests, windowMs } = config

  return function rateLimit(clientIp: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = clientIp
    const current = rateLimitStore[key] || { count: 0, resetTime: now + windowMs }

    // Reset if window expired
    if (now >= current.resetTime) {
      rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
      return { allowed: true, remaining: maxRequests - 1, resetTime: current.resetTime }
    }

    // Check if limit exceeded
    const allowed = current.count < maxRequests
    if (allowed) {
      current.count++
    }

    rateLimitStore[key] = current
    return {
      allowed,
      remaining: Math.max(0, maxRequests - current.count),
      resetTime: current.resetTime,
    }
  }
}

/**
 * Extract client IP from request
 * Handles proxies (Vercel, etc.)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") || "unknown"
}
