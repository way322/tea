import pool from '../db.js';


export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { items, address, name, total } = req.body;
    const userId = req.userData.userId;
    const deliveryDate = new Date(Date.now() + 21600000);

    // Проверка авторизации
    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    setTimeout(async () => {
      try {
        await pool.query('DELETE FROM Orders WHERE id = $1', [orderResult.rows[0].id]);
        console.log(`Order ${orderResult.rows[0].id} auto-deleted`);
      } catch (err) {
        console.error('Auto-delete error:', err);
      }
    }, 21600000);

    if (!req.userData?.userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Нет товаров в заказе' });
    }

    const productsCheck = await client.query(
      'SELECT id, price FROM products WHERE id = ANY($1::int[])',
      [items.map(i => i.id)]
    );

    if (productsCheck.rows.length !== items.length) {
      return res.status(400).json({
        message: 'Некоторые товары не найдены'
      });
    }

    const calculatedTotal = items.reduce((sum, item) => {
      const product = productsCheck.rows.find(p => p.id === item.id);
      return sum + (product.price * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({
        message: 'Несовпадение суммы заказа'
      });
    }

    const orderResult = await client.query(
      `INSERT INTO Orders (user_id, address, name, delivery_date, total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, address, name, deliveryDate, total]
    );

    for (const item of items) {
      await client.query(
        `INSERT INTO Order_items (order_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [orderResult.rows[0].id, item.id, item.quantity]
      );
    }

    await client.query(
      'DELETE FROM Cart WHERE user_id = $1',
      [userId]
    );

    const orderItemsResult = await client.query(
      `SELECT p.id, p.title, p.price, p.image_url, oi.quantity 
       FROM Order_items oi
       JOIN Products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderResult.rows[0].id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      ...orderResult.rows[0],
      items: orderItemsResult.rows
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    res.status(500).json({
      message: 'Ошибка при создании заказа',
      error: error.message
    });
  } finally {
    client.release();
  }
};

export const getOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
      o.id,
      ROW_NUMBER() OVER (ORDER BY o.created_at) as user_order_number,
      o.address,
      o.name,
      o.total,
      o.created_at,
      o.delivery_date,
      json_agg(json_build_object(
      'id', p.id,
      'title', p.title,
      'price', p.price,
      'image_url', p.image_url,
      'quantity', oi.quantity
    )) as items
    FROM Orders o
    JOIN Order_items oi ON o.id = oi.order_id
    JOIN Products p ON oi.product_id = p.id
    WHERE o.user_id = $1
     AND o.created_at > NOW() - INTERVAL '6 hours'
    GROUP BY o.id
    ORDER BY o.created_at DESC`,
      [req.userData.userId]
    );

    const formatted = rows.map(order => ({
      ...order,
      created_at: order.created_at.toISOString(),
      delivery_date: order.delivery_date.toISOString()
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      message: 'Ошибка при создании заказа',
      error: error.message
    });
  } 
};