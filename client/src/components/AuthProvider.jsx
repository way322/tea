import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncCart, initializeCart, addToCartDB } from '../store/cartSlice';
import { logout } from '../store/authSlice';

// Провайдер для управления авторизацией и синхронизацией корзины
const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const cart = useSelector(state => state.cart);

  // Инициализация корзины при монтировании
  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  // Синхронизация при изменении статуса авторизации
  useEffect(() => {
    const handleAuthChange = async () => {
      if (isAuthenticated) {
        try {
          // Синхронизация с сервером
          await dispatch(syncCart()).unwrap();
          
          // Перенос локальной корзины в БД
          const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
          if (localCart.items.length > 0) {
            for (const item of localCart.items) {
              try {
                await dispatch(addToCartDB(item)).unwrap();
              } catch (error) {
                console.error('Failed to add item:', item.id, error);
              }
            }
            localStorage.removeItem('cart'); // Очистка локальной корзины
          }
        } catch (error) {
          console.error('Auth change sync error:', error);
          if (error?.response?.status === 401) {
            dispatch(logout()); // Разлогин при 401 ошибке
          } else {
            localStorage.setItem('cart', JSON.stringify(cart)); // Сохранение в localStorage
          }
        }
      } else {
        // Сохранение корзины для неавторизованных
        localStorage.setItem('cart', JSON.stringify({
          items: cart.items,
          status: cart.status
        }));
      }
    };
    handleAuthChange();
  }, [isAuthenticated, token]);

  // Автосохранение при изменении корзины (с дебаунсом)
  useEffect(() => {
    let debounceTimer;
    
    const saveCart = async () => {
      try {
        if (isAuthenticated) {
          await dispatch(syncCart()).unwrap();
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        if (error?.response?.status === 401) {
          dispatch(logout());
        } else {
          localStorage.setItem('cart', JSON.stringify(cart));
        }
      }
    };
  
    if (isAuthenticated && cart.status === 'succeeded') {
      debounceTimer = setTimeout(saveCart, 1000); // Задержка 1 сек
    }
  
    return () => clearTimeout(debounceTimer);
  }, [cart.items, isAuthenticated]);

  // Сохранение перед закрытием вкладки
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isAuthenticated) {
        await dispatch(syncCart());
      } else if (cart.items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, cart]);

  return children;
};

export default AuthProvider;