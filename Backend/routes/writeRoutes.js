import { Router } from 'express';
import { shortenUrl } from '../controllers/writeController.js';
import { writeRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Route 1: The Shortening Path (The Write Endpoint)
// When a user sends a POST request with a long link, run the shortenUrl controller
router.post('/api/v1/shorten', writeRateLimiter, shortenUrl);


export default router;