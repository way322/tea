import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Асинхронное действие для загрузки товаров с сервера
 * @returns {Promise} Промис с массивом товаров
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      return response.data;
    } catch (error) {
      // Используем rejectWithValue для более структурированной ошибки
      return rejectWithValue({
        message: error.response?.data?.message || 'Ошибка загрузки товаров',
        status: error.response?.status
      });
    }
  }
);


// Слайс для управления состоянием товаров
 
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],       // Массив товаров
    status: 'idle',  // Статус загрузки: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null      // Информация об ошибке
  },
  reducers: {
    // Можно добавить редюсеры для локальных операций
  },
  extraReducers: (builder) => {
    builder
      // Обработка начала загрузки
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Сбрасываем ошибку при новой попытке загрузки
      })
      
      // Успешная загрузка
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Можно добавить нормализацию данных, например:
        state.items = action.payload.map(product => ({
          ...product,
          price: Number(product.price) // Преобразуем цену в число
        }));
      })
      
      // Ошибка загрузки
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        // Используем структурированное сообщение об ошибке
        state.error = action.payload?.message || action.error.message;
        
        // Можно добавить логирование ошибки
        console.error('Ошибка загрузки товаров:', {
          status: action.payload?.status,
          message: state.error
        });
      });
  },
});

export default productsSlice.reducer;