import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/toggle', toggleFavorite);
router.get('/', getFavorites);

export default router;