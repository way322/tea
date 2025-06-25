import { Router } from 'express';
import { createOrder } from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import { getOrders } from '../controllers/orderController.js';

const router = Router();
router.use(authMiddleware);
router.get('/', getOrders);
router.post('/', createOrder);

export default router;