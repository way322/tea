import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

// Создаем экземпляр роутера
const router = Router();

// Настраиваем маршруты:
router.post('/register', register); // POST /register → вызов register контроллера
router.post('/login', login);     // POST /login → вызов login контроллера

// Тестовый маршрут для проверки работы
router.get('/test', (req, res) => {
    console.log('[TEST ROUTE] Received request');
    res.send('OK'); // Просто возвращает 'OK'
});

// Экспортируем настроенный роутер
export default route