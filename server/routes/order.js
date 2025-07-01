import { Router } from 'express';
import { createOrder } from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import { getOrders } from '../controllers/orderController.js';

const router = Router();
router.use(authMiddleware); // Доступ только для авторизованных

// Работа с заказами:
router.get('/', getOrders); // Получить список заказов
router.post('/', createOrder); // Создать новый заказ

export default router;