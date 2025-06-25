import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import favoritesRouter from './routes/favorites.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/order.js';


dotenv.config();



const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
  
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use('/api/orders', orderRouter)
app.use('/api/cart', cartRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));