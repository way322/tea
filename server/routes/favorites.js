import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware); // Требуется авторизация

// Управление избранным:
router.post('/toggle', toggleFavorite); // Добавить/удалить из избранного
router.get('/', getFavorites); // Получить список избранного

export default router;