import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/get-result', aiController.getResult);
router.post('/chat', aiController.chat);

router.post('/generate-quiz', upload.single('file'), aiController.generateQuiz);

export default router
