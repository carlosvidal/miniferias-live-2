import express from 'express';
import { getUsers, createUser, updateUserRole, deleteUser } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Get all users
router.get('/', getUsers);

// Create new user
router.post('/', createUser);

// Update user role
router.patch('/:id/role', updateUserRole);

// Delete user
router.delete('/:id', deleteUser);

export default router;
