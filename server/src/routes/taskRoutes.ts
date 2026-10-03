import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

const taskCreateValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('project')
    .notEmpty().withMessage('Project is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid assignedTo user ID'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date format'),
];

const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid assignedTo user ID'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid date format'),
];

router.get('/', getTasks);
router.post('/', validate(taskCreateValidation), createTask);
router.get('/:id', getTask);
router.put('/:id', validate(taskUpdateValidation), updateTask);
router.delete('/:id', deleteTask);

export default router;
