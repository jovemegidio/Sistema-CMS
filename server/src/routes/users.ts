import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);

router.post('/', validate([
  { field: 'name', required: true, minLength: 2, maxLength: 100 },
  { field: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email is required.' },
  { field: 'password', required: true, minLength: 6 },
]), createUser);

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
