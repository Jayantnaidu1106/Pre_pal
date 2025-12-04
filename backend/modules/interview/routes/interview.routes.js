import { Router } from 'express';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';

const router = Router();

/**
 * Interview Module Routes
 * All routes are protected with JWT authentication
 * 
 * Future endpoints:
 * - POST /interview/start - Start AI mock interview
 * - POST /interview/:id/answer - Submit answer to interview question
 * - GET /interview/:id - Get interview session details
 * - POST /interview/:id/end - End interview and get feedback
 * - GET /interview/history - Get user's interview history
 */

// Placeholder endpoint
router.get('/health', authMiddleware.authUser, (req, res) => {
    res.json({
        module: 'interview',
        status: 'ready',
        message: 'Interview module is ready for implementation',
        user: req.user.email
    });
});

export default router;
