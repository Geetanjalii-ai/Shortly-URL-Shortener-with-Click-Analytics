import { Router } from 'express';
import { shortenUrl, getUserUrls } from '../controllers/writeController.js';
import { register, login } from '../controllers/authController.js';
import { optionalAuth, requireAuth } from '../middlewares/authMiddleware.js';
import { writeRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Authentication Routes
router.post('/api/auth/register', register);
router.post('/api/auth/login', login);

// Shortening Path (The Write Endpoint) - Optional Authentication, Rate Limited
router.post('/api/v1/shorten', optionalAuth, writeRateLimiter, shortenUrl);

// Retrieve all links for logged-in user - Requires Authentication
router.get('/api/v1/urls', requireAuth, getUserUrls);

export default router;