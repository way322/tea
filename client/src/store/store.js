import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';
import favoritesReducer from './favoritesSlice';
import productsReducer from './productsSlice';

// Функция для загрузки начального состояния из localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    return undefined;
  }
};

// Функция для сохранения состояния в localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (e) {
    // Обработка ошибок
  }
};

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: orderReducer,
    auth: authReducer,
    favorites: favoritesReducer,
    products: productsReducer,
  },
  preloadedState
});

// Подписываемся на изменения хранилища
store.subscribe(() => {
  saveState(store.getState());
});

export default store;