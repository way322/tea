import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { registerStart, registerSuccess, registerFailure } from '../../store/authSlice';
import korzina from '../../img/korzina.png';
import Logo from '../../img/Logo.png';
import Person from '../../img/Person.png';
import { formatPhone } from '../../utils/formatPhone';
import r from './Register.module.css'

// Компонент страницы регистрации
const Register = () => {
  // Хуки для работы с Redux и навигацией
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Получаем статус авторизации из Redux store
  const { isAuthenticated } = useSelector(state => state.auth);

  // Состояния компонента
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(''); // Сообщение об ошибке
  const [showPassword, setShowPassword] = useState({
    password: false,        // Видимость основного пароля
    confirmPassword: false  // Видимость подтверждения пароля
  });

  // Обработчик клика по корзине (проверка авторизации)
  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };
  
  // Форматирование номера телефона при вводе
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
  };
  
  // Отправка формы регистрации
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация полей формы
    if (!formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Все поля обязательны для заполнения!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    try {
      dispatch(registerStart()); // Начало процесса регистрации
      
      // Очистка номера от нецифровых символов
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      
      // Отправка данных на сервер
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        phone: cleanedPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Успешная регистрация
      dispatch(registerSuccess({
        user: response.data.user,
        token: response.data.token
      }));

      // Сохранение токена в localStorage
      localStorage.setItem('token', response.data.token);
      
      // Перенаправление в профиль
      navigate('/profile');
    } catch (err) {
      // Обработка ошибок регистрации
      dispatch(registerFailure(err.response?.data?.message || 'Ошибка регистрации'));
      setError(err.response?.data?.message || 'Ошибка при регистрации');
    }
  };

  return (
    <div className={r.container}>
      <header className={r.header}>
        <div className={r.navContainer}>
          <div className={r.nazv}>
            <Link to="/" className={r.logoLink}>
              <img src={Logo} alt="Логотип" className={r.logo} />
            </Link>
            <h1 className={r.title}>Aroma</h1>
          </div>
          <div className={r.iconsContainer}>
            <Link to="/cart" onClick={handleCartClick} className={r.cartLink}>
              <img src={korzina} alt="Корзина" className={r.cartIcon} />
            </Link>
            <Link to="/profile" className={r.profileLink}>
              <img src={Person} alt="Профиль" className={r.profileIcon} />
            </Link>
          </div>
        </div>
      </header>
  
      <div className={r.aContainer}>
        <div className={r.authContainer}>
          <h2 className={r.authTitle}>Регистрация</h2>
          {error && <p className={r.errorMessage}>{error}</p>}
          <form onSubmit={handleSubmit} className={r.authForm}>
            <div className={r.input}>
              <div className={r.formGroup}>
                <input
                  type="tel"
                  placeholder="+7 999 123 45 67"
                  pattern="\+7\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}"
                  required
                  className={r.formInput}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
              </div>
              
              <div className={r.formGroup}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.password ? 'text' : 'password'}
                    placeholder="Пароль"
                    minLength="8"
                    required
                    className={r.formInput}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className={r.toggleButton}
                    onClick={() => setShowPassword({
                      ...showPassword,
                      password: !showPassword.password
                    })}
                  >
                    {showPassword.password ? 'Скрыть' : 'Показать'}
                  </button>
                </div>
              </div>
              
              <div className={r.formGroup}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    placeholder="Повторите пароль"
                    required
                    className={r.formInput}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className={r.toggleButton}
                    onClick={() => setShowPassword({
                      ...showPassword,
                      confirmPassword: !showPassword.confirmPassword
                    })}
                  >
                    {showPassword.confirmPassword ? 'Скрыть' : 'Показать'}
                  </button>
                </div>
              </div>
            </div>
  
            <button 
              type="submit" 
              className={r.submitButton}
            >
              Зарегистрироваться
            </button>
          </form>
  
          <p className={r.authSwitch}>
            Уже есть аккаунт? 
            <Link to="/login" className={r.switchLink}>Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;