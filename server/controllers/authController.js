import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Функция для нормализации номера телефона:
// - Удаляет все нецифровые символы
// - Проверяет, что номер начинается с 7 и имеет 11 цифр
// - Возвращает номер в формате 79991234567
const normalizePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('7') || cleaned.length !== 11) {
    throw new Error('Неверный формат телефона. Пример: +7 999 123 45 67');
  }
  return cleaned;
};

// Контроллер для входа пользователя
export const login = async (req, res) => {
  try {
    console.log('[LOGIN] Запрос:', req.body);
    let { phone, password } = req.body;
    
    // Нормализуем номер телефона
    phone = normalizePhone(phone);
    console.log('[LOGIN] Нормализованный номер:', phone);

    // Ищем пользователя в базе данных по номеру телефона
    const user = await User.findByPhone(phone);
    console.log('[LOGIN] Найден пользователь:', user);
    
    // Если пользователь не найден - возвращаем ошибку
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }
    console.log('[LOGIN] Сравнение пароля с хешем:', user.password);

    // Сравниваем введенный пароль с хешем из базы данных
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('[LOGIN] Результат сравнения:', isMatch);
    // Если пароль не совпадает - возвращаем ошибку
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Генерируем JWT токен с ID пользователя, срок действия - 1 час
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('[LOGIN] Успешный вход');
    // Возвращаем токен и основные данные пользователя
    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone_number
      }
    });

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    // Определяем код статуса: 400 для ошибок валидации, 500 для остальных
    const status = error.message.includes('формат') ? 400 : 500;
    res.status(status).json({ 
      message: error.message || 'Ошибка сервера' 
    });
  }
};

// Контроллер для регистрации нового пользователя
export const register = async (req, res) => {
  try {
    let { phone, password, confirmPassword } = req.body;

    // Проверяем, что пароли совпадают
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Пароли не совпадают' });
    }
    // Проверяем минимальную длину пароля
    if (password.length < 8) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 8 символов' });
    }

    // Нормализуем номер телефона
    phone = normalizePhone(phone);
    console.log('[REGISTER] Нормализованный номер:', phone);

    // Проверяем, не зарегистрирован ли уже такой номер телефона
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хешируем пароль перед сохранением в базу данных
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('[REGISTER] Хеш пароля:', hashedPassword.slice(0, 12) + '...');

    // Создаем нового пользователя в базе данных
    const newUser = await User.create({
      phone_number: phone,
      password: hashedPassword
    });

    // Генерируем JWT токен с ID нового пользователя, срок действия - 24 часа
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[REGISTER] Успешная регистрация');
    // Возвращаем токен и основные данные нового пользователя
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        phone: newUser.phone_number
      }
    });

  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    // Определяем код статуса: 400 для ошибок валидации, 500 для остальных
    const status = error.message.includes('формат') ? 400 : 500;
    res.status(status).json({
      message: error.message || 'Ошибка сервера'
    });
  }
};

