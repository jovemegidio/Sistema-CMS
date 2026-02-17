import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost } from '../controllers/postController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/', getPosts);
router.get('/:id', getPost);

router.post('/', validate([
  { field: 'title', required: true, minLength: 3, maxLength: 200 },
]), createPost);

router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
