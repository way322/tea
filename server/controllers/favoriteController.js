import pool from '../db.js';

// Контроллер для добавления/удаления товара из избранного
export const toggleFavorite = async (req, res) => {
  const { productId } = req.body;  // ID товара из тела запроса
  const userId = req.userData.userId;  // ID пользователя из JWT токена

  try {
    // Проверяем, есть ли уже такой товар в избранном у пользователя
    const existing = await pool.query(
      'SELECT * FROM Favorite WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    // Если товар уже в избранном - удаляем его
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM Favorite WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return res.json({ action: 'removed' });  // Возвращаем статус удаления
    } 
    // Если товара нет в избранном - добавляем
    else {
      await pool.query(
        'INSERT INTO Favorite (user_id, product_id) VALUES ($1, $2)',
        [userId, productId]
      );
      return res.json({ action: 'added' });  // Возвращаем статус добавления
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Контроллер для получения списка избранных товаров пользователя
export const getFavorites = async (req, res) => {
  const userId = req.userData.userId;  // ID пользователя из JWT токена
  
  try {
    // Получаем все товары из избранного для пользователя
    const { rows } = await pool.query(
      'SELECT product_id FROM Favorite WHERE user_id = $1',
      [userId]
    );
    
    // Преобразуем результат в массив ID товаров
    const favorites = rows.map(row => row.product_id);
    
    // Возвращаем массив ID избранных товаров
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};