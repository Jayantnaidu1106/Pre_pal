import { Router } from 'express';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';
import * as saveQuizController from '../controllers/saveQuiz.controller.js';
import * as getQuizHistoryController from '../controllers/getQuizHistory.controller.js';
import * as getQuizResultController from '../controllers/getQuizResult.controller.js';

const router = Router();

/**
 * Quiz Module Routes
 * All routes are protected with JWT authentication
 */

// Save a quiz result
router.post('/result', authMiddleware.authUser, saveQuizController.saveQuizResult);

// Get user's quiz history
router.get('/history', authMiddleware.authUser, getQuizHistoryController.getQuizHistory);

// Get single quiz result
router.get('/result/:id', authMiddleware.authUser, getQuizResultController.getQuizResult);

router.get('/health', authMiddleware.authUser, (req, res) => {
    res.json({
        module: 'quiz',
        status: 'active',
        message: 'Quiz module endpoints are active',
        user: req.user.email
    });
});

export default router;
