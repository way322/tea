import jwt from 'jsonwebtoken';
import pool from '../db.js';

export default async (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неверный формат токена' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (!rows.length) {
      return res.status(401).json({ message: 'Пользователь не существует' });
    }

    req.userData = { 
      userId: decoded.userId,
      token
    };
    
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    
    const messages = {
      TokenExpiredError: 'Срок действия токена истек',
      JsonWebTokenError: 'Недействительный токен',
      NotBeforeError: 'Токен неактивен'
    };

    res.status(401).json({
      message: messages[error.name] || 'Ошибка аутентификации'
    });
  }
};