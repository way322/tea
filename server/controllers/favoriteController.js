import pool from '../db.js';

export const toggleFavorite = async (req, res) => {
  const { productId } = req.body;
  const userId = req.userData.userId;

  try {
    const existing = await pool.query(
      'SELECT * FROM Favorite WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM Favorite WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return res.json({ action: 'removed' });
    } else {
      await pool.query(
        'INSERT INTO Favorite (user_id, product_id) VALUES ($1, $2)',
        [userId, productId]
      );
      return res.json({ action: 'added' });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getFavorites = async (req, res) => {
  const userId = req.userData.userId;
  
  try {
    const { rows } = await pool.query(
      'SELECT product_id FROM Favorite WHERE user_id = $1',
      [userId]
    );
    
    const favorites = rows.map(row => row.product_id);
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};