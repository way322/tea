
import pool from '../db.js';

//Контроллер для получения списка товаров
// GET /api/products

export const getProducts = async (req, res) => {
  try {
    // Выполняем SQL-запрос для получения всех товаров из таблицы products
    const { rows } = await pool.query('SELECT * FROM products');
    
    // Отправляем успешный ответ с массивом товаров
    res.json(rows);
    
  } catch (error) {
    // Логируем ошибку в консоль сервера
    console.error(error);
    
    // Отправляем клиенту ошибку 500 с сообщением
    res.status(500).json({ 
      message: 'Ошибка получения товаров' 
    });
  }
};