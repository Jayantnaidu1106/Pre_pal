import {Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/create',
    [body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters')],
    authMiddleware.authUser,
    projectController.createProject);

router.get('/all', authMiddleware.authUser, projectController.getAllProjects);

router.put('/add-user', authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({min:1}).withMessage('At least one user is required').bail().custom((users)=>users.every(user=>typeof user === 'string')).withMessage('Users must be an array of strings'),
    projectController.addUserToProject);

router.get('/get-project/:projectId',
     authMiddleware.authUser, projectController.getProjectById);

export default router;