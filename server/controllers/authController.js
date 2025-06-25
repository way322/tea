import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const normalizePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('7') || cleaned.length !== 11) {
    throw new Error('Неверный формат телефона. Пример: +7 999 123 45 67');
  }
  return cleaned;
};

export const login = async (req, res) => {
  try {
    console.log('[LOGIN] Запрос:', req.body);
    let { phone, password } = req.body;
    
    phone = normalizePhone(phone);
    console.log('[LOGIN] Нормализованный номер:', phone);

    const user = await User.findByPhone(phone);
    console.log('[LOGIN] Найден пользователь:', user);
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    console.log('[LOGIN] Сравнение пароля с хешем:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('[LOGIN] Результат сравнения:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('[LOGIN] Успешный вход');
    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone_number
      }
    });

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    const status = error.message.includes('формат') ? 400 : 500;
    res.status(status).json({ 
      message: error.message || 'Ошибка сервера' 
    });
  }
};

export const register = async (req, res) => {
  try {
    let { phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Пароли не совпадают' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 8 символов' });
    }

    phone = normalizePhone(phone);
    console.log('[REGISTER] Нормализованный номер:', phone);

    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('[REGISTER] Хеш пароля:', hashedPassword.slice(0, 12) + '...');

    const newUser = await User.create({
      phone_number: phone,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[REGISTER] Успешная регистрация');
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        phone: newUser.phone_number
      }
    });

  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    const status = error.message.includes('формат') ? 400 : 500;
    res.status(status).json({
      message: error.message || 'Ошибка сервера'
    });
  }
};

