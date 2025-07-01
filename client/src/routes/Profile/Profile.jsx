import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createSelector } from '@reduxjs/toolkit';
import { logout } from '../../store/authSlice';
import { clearCart } from '../../store/cartSlice';
import { clearOrders } from '../../store/orderSlice';
import korzina from '../../img/korzina.png';
import korzina2 from '../../img/korzina2.png';
import Logo from '../../img/Logo.png';
import Person from '../../img/Person.png';

import { fetchFavorites } from '../../store/favoritesSlice';
import { toggleFavorite } from '../../store/favoritesSlice';
import HeartFilled from '../../img/HeartFilled.png';
import { clearFavorites } from '../../store/favoritesSlice';
import { fetchOrders } from '../../store/orderSlice';
import { addToCartDB } from '../../store/cartSlice';

import p from './Profile.module.css'
// Селектор для получения ID избранных товаров
const selectFavorites = state => state.favorites.items;
// Селектор для получения всех товаров
const selectProducts = state => state.products.items;
// Мемоизированный селектор для фильтрации избранных товаров
const memoizedFavorites = createSelector(
  [selectFavorites, selectProducts],
  (favorites, products) => products.filter(p => favorites.includes(p.id))
);

// Компонент страницы профиля пользователя
const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Состояния компонента
  const [isVisible, setIsVisible] = useState(false); // Анимация появления
  const [timeLeft, setTimeLeft] = useState({}); // Таймер доставки заказов

  // Получение данных из Redux store
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { items: orders, status: ordersStatus, error: ordersError } = useSelector(state => state.orders);
  const favoriteProducts = useSelector(memoizedFavorites); // Мемоизированные избранные товары

  // Эффект для анимации появления
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else {
      dispatch(fetchOrders());
      dispatch(fetchFavorites());
    }
  }, [isAuthenticated, dispatch, navigate]);

  // Таймер обратного отсчета для заказов
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      orders?.forEach(order => {
        const diff = new Date(order.delivery_date) - Date.now();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        newTimeLeft[order.id] = diff > 0 
          ? `${hours}ч ${minutes}м` 
          : 'Доставлен';
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [orders]);

  // Выход из аккаунта
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearOrders());
    dispatch(clearFavorites());
    navigate('/');
  };

  // Загрузка и ошибки
  if (ordersStatus === 'loading') return <div>Загрузка...</div>;
  if (ordersError) return <div>Ошибка: {ordersError}</div>;

return (
  <div className={`${p.container} ${isVisible ? p.visible : ''}`}>
    <header className={p.header}>
      <div className={p.navContainer}>
        <div className={p.nazv}>
          <Link to="/" className={p.logoLink}>
            <img src={Logo} alt="Логотип" className={p.logo} />
          </Link>
          <h1 className={p.title}>Aroma</h1>
        </div>
        <div className={p.iconsContainer}>
          <Link to="/cart" className={p.cartLink}>
            <img 
              src={korzina} 
              alt="Корзина" 
              className={`${p.cartIcon} ${p.iconHover}`} 
            />
          </Link>
          <Link to="/profile" className={p.profileLink}>
            <img 
              src={Person} 
              alt="Профиль" 
              className={`${p.profileIcon} ${p.iconHover}`} 
            />
          </Link>
        </div>
      </div>
    </header>
  
      <div className={p.mainContent}>
        <div className={p.section}>
          <h2 className={p.sectionTitle}>Заказы</h2>
          <div className={p.ordersContainer}> 
          {ordersStatus === 'loading' ? (
            <div className={p.loading}>Загрузка заказов...</div>
          ) : ordersError ? (
            <div className={p.error}>Ошибка загрузки заказов: {ordersError}</div>
          ) : orders.length === 0 ? (
            <p className={p.empty}>Нет активных заказов</p>
          ) : (
            orders.map((order, index) => (
              <div 
                key={order.id} 
                className={`${p.orderCard} ${p.cardAnimation}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={p.orderHeader}>
                  <h3 className={p.orderNumber}>Заказ #{order.orderNumber}</h3>
                  <p className={`${p.orderTimer} ${timeLeft[order.id]?.includes('0ч') ? p.pulse : ''}`}>
                    Время доставки: {timeLeft[order.id] || 'Рассчет времени...'}
                  </p>
                </div>
                 
                <div className={p.orderDetails}>
                  <div className={p.orderInfo}>
                    <p className={p.infoLine}><strong>Адрес:</strong> {order.address}</p>
                    <p className={p.infoLine}><strong>Имя:</strong> {order.name}</p>
                    <p className={p.infoLine}><strong>Сумма:</strong> {order.total}₽</p>
                    <p className={p.infoLine}>
                      <strong>Дата заказа:</strong> {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
  
                  <div className={p.orderProducts}>
                    {order.items.map(item => (
                      <div key={item.id} className={p.productItem}>
                        <img
                          src={`/img/${item.image_url}`}
                          alt={item.title}
                          className={p.productImage}
                        />
                        <div className={p.productInfo}>
                          <p className={p.productTitle}>{item.title}</p>
                          <p className={p.productPrice}>{item.price}₽ x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        <div className={p.section2}>
          <h2 className={p.sectionTitle}>Избранное</h2>
          {favoriteProducts.length === 0 ? (
            <p className={p.empty}>Нет избранных товаров</p>
          ) : (
            <div className={p.favoritesGrid}>
              {favoriteProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`${p.favoriteCard} ${p.cardAnimation}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img 
                    src={`/img/${product.image_url}`} 
                    alt={product.title} 
                    className={p.favoriteImage}
                  />
                  <div className={p.favoriteInfo}>
                    <p className={p.favoriteTitle}>{product.title}</p>
                    <p className={p.favoritePrice}>{product.price}Р</p>
                  </div>
                  <div className={p.favoriteActions}>
                    <button 
                      onClick={() => dispatch(addToCartDB(product))} 
                      className={p.cartButton}
                    >
                      <img 
                        src={korzina2} 
                        alt="В корзину" 
                        className={`${p.actionIcon} ${p.bounce}`} 
                      />
                    </button>
                    <button 
                      onClick={() => dispatch(toggleFavorite(product.id))} 
                      className={p.cartButton}
                    >
                      <img 
                        src={HeartFilled} 
                        alt="Удалить" 
                        className={`${p.actionIcon} ${p.heartBeat}`} 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
  
        <div className={p.section3}>
          <h2 className={p.sectionTitle}>Личные данные</h2>
          <div className={p.profileInfo}>
            <p className={p.infoItem}>Телефон: {user?.phone}</p>
            <button 
              onClick={handleLogout} 
              className={`${p.logoutButton} ${p.pulseHover}`}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;