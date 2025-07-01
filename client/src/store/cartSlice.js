import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Уменьшение количества товара
export const decrementQuantity = createAsyncThunk(
  'cart/decrement',
  async (productId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/cart/${productId}/decrement`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }// JWT в заголовке
      );
      return response.data; // {productId, removed, newQuantity}
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
  }
);

// Синхронизация с серверной корзиной
export const syncCart = createAsyncThunk(
  'cart/sync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) throw new Error('No authentication token');
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      // Нормализация данных с сервера
      return response.data.map(item => ({
        id: item.product_id,
        title: item.title,
        price: Number(item.price),
        image_url: item.image_url,
        quantity: item.quantity
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Unauthorized'); // Специальная обработка 401
      }
      return rejectWithValue(error.message);
    }
  }
);


// Добавление товара в корзину
export const addToCartDB = createAsyncThunk(
  'cart/add',
  async (product, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) throw new Error('No authentication token');
      
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      return {
        ...product,
        quantity: response.data.newQuantity // Обновленное количество
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Unauthorized');
      }
      return rejectWithValue(error.message);
    }
  }
);

// Инициализация корзины (загрузка из localStorage или с сервера)
export const initializeCart = createAsyncThunk(
  'cart/initialize',
  async (_, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      await dispatch(syncCart()); // Для авторизованных - синхронизация
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart'));
      if (localCart?.items) return localCart; // Для гостей - из localStorage
    }
    return null;
  }
);

// Очистка корзины
export const clearCartDB = createAsyncThunk(
  'cart/clear',
  async (_, { getState }) => {
    const { auth } = getState();
    await axios.delete('http://localhost:5000/api/cart/clear', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
  }
);

// Создание slice для корзины
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],    // Массив товаров
    status: 'idle', // Состояние загрузки
    error: null    // Ошибки
  },
  reducers: {
    // Локальные редюсеры (без API)
    addToCart: (state, action) => {
      const item = state.items.find(i => i.id === action.payload.id);
      item ? item.quantity++ : state.items.push({ ...action.payload, quantity: 1 });
    },
    clearCart: (state) => {
      state.items = [];
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка успешного уменьшения количества
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        const { productId, removed, newQuantity } = action.payload;
        if (removed) {
          state.items = state.items.filter(item => item.id !== productId);
        } else {
          const item = state.items.find(i => i.id === productId);
          if (item) item.quantity = newQuantity;
        }
      })
      // Ошибка уменьшения количества
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Ошибка обновления корзины';
      })
      // Инициализация корзины
      .addCase(initializeCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
        }
      })
      // Успешная синхронизация
      .addCase(syncCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      // Успешное добавление товара
      .addCase(addToCartDB.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.id);
        item ? item.quantity++ : state.items.push({ ...action.payload, quantity: 1 });
      })
      // Очистка корзины
      .addCase(clearCartDB.fulfilled, (state) => {
        state.items = [];
      })
      // Ошибка синхронизации - сохраняем локально
      .addCase(syncCart.rejected, (state) => {
        localStorage.setItem('cart', JSON.stringify(state));
      });
  }
});

// Экспорт действий и редюсера
export const { addToCart, clearCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;