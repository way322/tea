import { Router } from 'express';
import cartController from '../controllers/cartController.js'; 
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware); // Проверка авторизации для всех маршрутов

// Основные операции с корзиной:
router.get('/', cartController.getCart); // Получить корзину
router.post('/add', cartController.addToCart); // Добавить товар
router.delete('/:productId', cartController.removeFromCart); // Удалить товар
router.patch('/:productId/decrement', cartController.decrementQuantity); // Уменьшить количество
router.delete('/clear', cartController.clearCart); // Очистить корзину

export default router;