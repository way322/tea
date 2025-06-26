import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncCart, initializeCart, addToCartDB } from '../store/cartSlice';
import { logout } from '../store/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(state => state.auth);
  const cart = useSelector(state => state.cart);

  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  useEffect(() => {
    const handleAuthChange = async () => {
      if (isAuthenticated) {
        try {
          await dispatch(syncCart()).unwrap();
          
          const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
          if (localCart.items.length > 0) {
            for (const item of localCart.items) {
              try {
                await dispatch(addToCartDB(item)).unwrap();
              } catch (error) {
                console.error('Failed to add item:', item.id, error);
              }
            }
            localStorage.removeItem('cart');
          }
        } catch (error) {
          console.error('Auth change sync error:', error);
          if (error?.response?.status === 401 || error === 'Unauthorized') {
            dispatch(logout());
          } else {
            localStorage.setItem('cart', JSON.stringify(cart));
          }
        }
      } else {
        localStorage.setItem('cart', JSON.stringify({
          items: cart.items,
          status: cart.status
        }));
      }
    };
    handleAuthChange();
  }, [isAuthenticated, token, dispatch]);

  useEffect(() => {
    let debounceTimer;
    
    const saveCart = async () => {
      try {
        if (isAuthenticated) {
          await dispatch(syncCart()).unwrap();
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        if (error?.response?.status === 401 || error === 'Unauthorized') {
          dispatch(logout());
        } else {
          localStorage.setItem('cart', JSON.stringify(cart));
        }
      }
    };
  
    if (isAuthenticated && cart.status === 'succeeded') {
      debounceTimer = setTimeout(saveCart, 1000);
    }
  
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [cart.items, isAuthenticated, dispatch]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isAuthenticated) {
        try {
          await dispatch(syncCart());
        } catch (error) {
          console.error('Sync error on unload:', error);
        }
      } else if (cart.items.length > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, cart, dispatch]);

  return children;
};

export default AuthProvider;