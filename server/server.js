import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import favoritesRouter from './routes/favorites.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/order.js';


// Загрузка переменных окружения
dotenv.config();

// Создание Express-приложения
const app = express();

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:5173', // Разрешенный origin (Vite dev server)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Разрешенные HTTP-методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
  credentials: true // Разрешение передачи кук/авторизации
}));

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение маршрутов
app.use('/api/orders', orderRouter); // Маршруты заказов
app.use('/api/cart', cartRouter); // Маршруты корзины
app.use('/api/products', productsRouter); // Маршруты товаров
app.use('/api/auth', authRouter); // Маршруты аутентификации
app.use('/api/favorites', favoritesRouter); // Маршруты избранного

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));