import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

const projectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'on-hold', 'completed', 'archived'])
    .withMessage('Invalid status value'),
];

router.get('/', getProjects);
router.post('/', validate(projectValidation), createProject);
router.get('/:id', getProject);
router.put('/:id', validate(projectValidation), updateProject);
router.delete('/:id', deleteProject);

export default router;
