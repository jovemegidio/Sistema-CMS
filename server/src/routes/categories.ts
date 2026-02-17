import { Router } from 'express';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post('/', authorize('admin', 'editor'), validate([
  { field: 'name', required: true, minLength: 2, maxLength: 100 },
]), createCategory);

router.put('/:id', authorize('admin', 'editor'), updateCategory);
router.delete('/:id', authorize('admin'), deleteCategory);

export default router;
