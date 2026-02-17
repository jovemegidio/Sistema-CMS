import { Router } from 'express';
import { login, register, getMe, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.post('/login', validate([
  { field: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email is required.' },
  { field: 'password', required: true, minLength: 6 },
]), login);

router.post('/register', validate([
  { field: 'name', required: true, minLength: 2, maxLength: 100 },
  { field: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email is required.' },
  { field: 'password', required: true, minLength: 6 },
]), register);

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
