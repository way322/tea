import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Асинхронное действие для загрузки избранных товаров
export const fetchFavorites = createAsyncThunk(
  'favorites/fetch',
  async (_, { getState }) => {
    const { auth } = getState(); // Получаем токен из состояния auth
    const response = await axios.get(
      'http://localhost:5000/api/favorites',
      {
        headers: {
          Authorization: `Bearer ${auth.token}` // Передаем токен в заголовке
        }
      }
    );
    return response.data; // Возвращаем массив ID избранных товаров
  }
);

// Асинхронное действие для добавления/удаления из избранного
export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async (productId, { getState }) => {
    const { auth } = getState();
    const response = await axios.post(
      'http://localhost:5000/api/favorites/toggle',
      { productId }, // ID товара для добавления/удаления
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    );
    // Возвращаем ID товара и выполненное действие
    return { productId, action: response.data.action };
  }
);

// Создание slice для избранных товаров
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],    // Массив ID избранных товаров
    loading: false, // Флаг загрузки
    error: null    // Сообщение об ошибке
  },
  reducers: {
    // Редюсер для очистки избранного
    clearFavorites(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка начала загрузки избранного
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Успешная загрузка избранного
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload; // Обновляем список ID
      })
      // Ошибка загрузки
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Обработка переключения избранного
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload.action === 'removed') {
          // Удаляем ID товара из массива
          state.items = state.items.filter(id => id !== action.payload.productId);
        } else {
          // Добавляем ID товара в массив
          state.items.push(action.payload.productId);
        }
      });
  }
});

// Экспорт действий и редюсера
export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;