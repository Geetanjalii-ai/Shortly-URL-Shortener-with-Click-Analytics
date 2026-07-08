import redisClient from '../config/redis.js';

export async function writeRateLimiter(req, res, next) {
  // Extract client IP address safely
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const redisKey = `ratelimit:write:${ip}`;

  const LIMIT = 10;          // Maximum allowed creations
  const WINDOW_SECONDS = 60; // Reset window timeframe

  try {
    // 1. Atomically increment the IP's request counter in Redis memory
    const currentRequests = await redisClient.incr(redisKey);

    // 2. If it's the very first request in this cycle, set a 60-second expiration
    if (currentRequests === 1) {
      await redisClient.expire(redisKey, WINDOW_SECONDS);
    }

    // 3. Set standard rate-limiting headers for transparency
    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - currentRequests));

    // 4. If they breach the threshold, block the execution path immediately
    if (currentRequests > LIMIT) {
      console.warn(`[RateLimit] Blocked spam request from IP: ${ip}`);
      return res.status(429).json({
        error: 'Too many requests.',
        message: `You have exceeded the creation limit of ${LIMIT} links per minute. Please try again later.`
      });
    }

    // If everything passes cleanly, hand off control to the controller
    next();
  } catch (error) {
    console.error('Rate limiter exception:', error.message);
    // Fail-open strategy: If Redis has an issue, let the request through to keep app alive
    next();
  }
}