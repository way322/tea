import pool from '../db.js';

export const getCart = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.id as product_id,
        p.title,
        p.price,
        p.image_url,
        c.quantity
      FROM Cart c
      JOIN Products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [req.userData.userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Ошибка получения корзины' });
  }
};


export const clearCart = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM Cart WHERE user_id = $1',
      [req.userData.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка очистки корзины' });
  }
};

export const decrementQuantity = async (req, res) => {
  const { productId } = req.params;
  const userId = req.userData.userId;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ 
      message: 'Неверный ID товара',
      details: `Получен ID: ${productId} (${typeof productId})`
    });
  }

  const parsedProductId = parseInt(productId, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkQuery = await client.query(
      `SELECT quantity FROM Cart 
       WHERE user_id = $1 AND product_id = $2 
       FOR UPDATE`,
      [userId, parsedProductId]
    );

    if (checkQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Товар не найден в корзине',
        productId: parsedProductId
      });
    }

    const currentQuantity = checkQuery.rows[0].quantity;
    
    if (currentQuantity === 1) {
      await client.query(
        `DELETE FROM Cart 
         WHERE user_id = $1 AND product_id = $2`,
        [userId, parsedProductId]
      );
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        productId: parsedProductId,
        removed: true,
        newQuantity: 0
      });
    } else {
      const updateQuery = await client.query(`
        UPDATE Cart 
        SET quantity = quantity - 1
        WHERE user_id = $1 AND product_id = $2
        RETURNING quantity`,
        [userId, parsedProductId]
      );

      await client.query('COMMIT');
      
      return res.json({
        success: true,
        productId: parsedProductId,
        removed: false,
        newQuantity: updateQuery.rows[0].quantity
      });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Decrement Error:', error.stack);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера',
      details: error.message
    });
  } finally {
    client.release();
  }
};


export const addToCart = async (req, res) => {
  const { productId } = req.body;
  
  try {
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    const result = await pool.query(`
      INSERT INTO Cart (user_id, product_id, quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET quantity = Cart.quantity + 1
      RETURNING *
    `, [req.userData.userId, productId]);
    
    res.json({ 
      success: true,
      newQuantity: result.rows[0].quantity 
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Ошибка добавления в корзину' });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    await pool.query(
      `DELETE FROM Cart 
       WHERE user_id = $1 AND product_id = $2`,
      [req.userData.userId, productId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления из корзины' });
  }
};




export default {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  decrementQuantity
};