import pool from '../db.js';

// Модель пользователя для работы с БД
export default class User {
  
  // Поиск пользователя по телефону
  static async findByPhone(phone) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [phone]
      );
      return rows[0] || null; // Возвращаем пользователя или null
    } catch (error) {
      console.error('User search error:', error);
      throw error; // Пробрасываем ошибку
    }
  }

  // Создание нового пользователя
  static async create(userData) {
    try {
      const { rows } = await pool.query(
        'INSERT INTO users (phone_number, password) VALUES ($1, $2) RETURNING *',
        [userData.phone_number, userData.password]
      );
      return rows[0]; // Возвращаем созданного пользователя
    } catch (error) {
      console.error('User creation error:', error);
      throw error; // Пробрасываем ошибку
    }
  }
}