import pool from '../db.js';

// Контроллер для получения содержимого корзины пользователя
export const getCart = async (req, res) => {
  try {
    // Выполняем SQL-запрос для получения товаров в корзине
    const { rows } = await pool.query(`
      SELECT 
        p.id as product_id,
        p.title,
        p.price,
        p.image_url,
        c.quantity
      FROM Cart c
      JOIN Products p ON c.product_id = p.id  // Соединяем таблицы Cart и Products
      WHERE c.user_id = $1  // Фильтруем по ID пользователя
    `, [req.userData.userId]);  // ID пользователя из JWT токена
    
    // Возвращаем список товаров в корзине
    res.json(rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Ошибка получения корзины' });
  }
};

// Контроллер для полной очистки корзины пользователя
export const clearCart = async (req, res) => {
  try {
    // Удаляем все записи корзины для текущего пользователя
    await pool.query(
      'DELETE FROM Cart WHERE user_id = $1',
      [req.userData.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка очистки корзины' });
  }
};

// Контроллер для уменьшения количества товара в корзине
export const decrementQuantity = async (req, res) => {
  const { productId } = req.params;  // ID товара из параметров URL
  const userId = req.userData.userId; // ID пользователя из токена

  // Валидация ID товара
  if (!productId || isNaN(productId)) {
    return res.status(400).json({ 
      message: 'Неверный ID товара',
      details: `Получен ID: ${productId} (${typeof productId})`
    });
  }

  const parsedProductId = parseInt(productId, 10);
  const client = await pool.connect();  // Получаем клиента из пула соединений

  try {
    await client.query('BEGIN');  // Начинаем транзакцию

    // Проверяем наличие товара в корзине с блокировкой строки
    const checkQuery = await client.query(
      `SELECT quantity FROM Cart 
       WHERE user_id = $1 AND product_id = $2 
       FOR UPDATE`,  // Блокируем строку для изменения
      [userId, parsedProductId]
    );

    // Если товар не найден в корзине
    if (checkQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Товар не найден в корзине',
        productId: parsedProductId
      });
    }

    const currentQuantity = checkQuery.rows[0].quantity;
    
    // Если количество товара = 1, удаляем его из корзины
    if (currentQuantity === 1) {
      await client.query(
        `DELETE FROM Cart 
         WHERE user_id = $1 AND product_id = $2`,
        [userId, parsedProductId]
      );
      
      await client.query('COMMIT');  // Подтверждаем транзакцию
      
      return res.json({
        success: true,
        productId: parsedProductId,
        removed: true,  // Флаг полного удаления товара
        newQuantity: 0
      });
    } 
    // Иначе уменьшаем количество на 1
    else {
      const updateQuery = await client.query(`
        UPDATE Cart 
        SET quantity = quantity - 1
        WHERE user_id = $1 AND product_id = $2
        RETURNING quantity`,  // Возвращаем новое количество
        [userId, parsedProductId]
      );

      await client.query('COMMIT');
      
      return res.json({
        success: true,
        productId: parsedProductId,
        removed: false,  // Флаг уменьшения количества
        newQuantity: updateQuery.rows[0].quantity
      });
    }

  } catch (error) {
    await client.query('ROLLBACK');  // Откатываем транзакцию при ошибке
    console.error('Decrement Error:', error.stack);
    res.status(500).json({ 
      message: 'Внутренняя ошибка сервера',
      details: error.message
    });
  } finally {
    client.release();  // Освобождаем клиента обратно в пул
  }
};

// Контроллер для добавления товара в корзину
export const addToCart = async (req, res) => {
  const { productId } = req.body;  // ID товара из тела запроса
  
  try {
    // Проверяем существование товара в базе
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    // Используем UPSERT:
    // - Если товара нет в корзине - добавляем с quantity=1
    // - Если есть - увеличиваем quantity на 1
    const result = await pool.query(`
      INSERT INTO Cart (user_id, product_id, quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, product_id)  // При конфликте по составному ключу
      DO UPDATE SET quantity = Cart.quantity + 1  // Увеличиваем количество
      RETURNING *  // Возвращаем обновленную запись
    `, [req.userData.userId, productId]);
    
    // Возвращаем результат с новым количеством товара
    res.json({ 
      success: true,
      newQuantity: result.rows[0].quantity 
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Ошибка добавления в корзину' });
  }
};

// Контроллер для полного удаления товара из корзины
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;  // ID товара из параметров URL

  try {
    // Удаляем конкретный товар из корзины пользователя
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

// Экспорт всех контроллеров корзины
export default {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  decrementQuantity
};