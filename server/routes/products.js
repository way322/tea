import { Router } from 'express';
import { getProducts } from '../controllers/productController.js';

const router = Router();

// Публичный доступ к товарам:
router.get('/', getProducts); // Получить список всех товаров

export default router;