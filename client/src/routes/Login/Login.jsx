import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import korzina from '../../img/korzina.png';
import Logo from '../../img/Logo.png';
import Person from '../../img/Person.png';
import axios from 'axios';

import l from './Login.module.css'

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(loginStart());
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      console.log('Данные для отправки на сервер:', {
        phone: cleanedPhone,
        password: formData.password
      });
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        phone: formData.phone, 
        password: formData.password
      });
  
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token
      }));
  
      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (err) {
      console.error('Ошибка входа:', err);
      const errorMessage = err.response?.data?.message || 'Неверный номер или пароль';
      dispatch(loginFailure(errorMessage));
    }
  };
  return (
    <div className={l.container}>
      <header className={l.header}>
        <div className={l.navContainer}>
          <div className={l.nazv}>
            <Link to="/" className={l.logoLink}>
              <img src={Logo} alt="Логотип" className={l.logo} />
            </Link>
            <h1 className={l.title}>Aroma</h1>
          </div>
          <div className={l.iconsContainer}>
            <Link to="/cart" onClick={handleCartClick} className={l.cartLink}>
              <img src={korzina} alt="Корзина" className={l.cartIcon} />
            </Link>
            <Link to="/profile" className={l.profileLink}>
              <img src={Person} alt="Профиль" className={l.profileIcon} />
            </Link>
          </div>
        </div>
      </header>
      <div className={l.aContainer}>
      <div className={l.authContainer}>
        <h2 className={l.authTitle}>Вход</h2>
        <form onSubmit={handleSubmit} className={l.authForm}>
          <div className={l.input}>
          <div className={l.formGroup}>
            <input
              type="tel"
              placeholder="+7 999 123 45 67"
              pattern="\+7\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}"
              required
              className={l.formInput}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className={l.formGroup}>
            <input
              type="password"
              placeholder="Пароль"
              required
              className={l.formInput}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          </div>

          {error && <p className={l.errorMessage}>{error}</p>}

          <button 
            type="submit" 
            className={l.submitButton} 
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <p className={l.authSwitch}>
          Нет аккаунта?
          <Link to="/register" className={l.switchLink}>Зарегистрироваться</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;