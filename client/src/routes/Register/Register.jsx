import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


import { registerStart, registerSuccess, registerFailure } from '../../store/authSlice';
import korzina from '../../img/korzina.png';
import Logo from '../../img/Logo.png';
import Person from '../../img/Person.png';

import r from './Register.module.css'

const Register = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Все поля обязательны для заполнения!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    try {
      dispatch(registerStart()); 
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        phone: cleanedPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      dispatch(registerSuccess({
        user: response.data.user,
        token: response.data.token
      }));

      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (err) {
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className={r.formGroup}>
                <input
                  type="password"
                  placeholder="Пароль"
                  minLength="8"
                  required
                  className={r.formInput}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className={r.formGroup}>
                <input
                  type="password"
                  placeholder="Повторите пароль"
                  required
                  className={r.formInput}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
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