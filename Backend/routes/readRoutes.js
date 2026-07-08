import { Router } from 'express';
import { redirectUrl,getUrlAnalytics} from '../controllers/readController.js';

const router = Router();

// Route 2: The Redirection Path (The Read Endpoint)
// When a user hits the base URL with a short code (e.g., localhost:3000/1000000), redirect them
router.get('/:shortCode', redirectUrl);
router.get('/api/v1/analytics/:shortCode',getUrlAnalytics);

export default router;