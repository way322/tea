import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Асинхронное действие для загрузки заказов пользователя
export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (_, { getState }) => {
    const { auth } = getState(); // Получаем токен из состояния auth
    const response = await axios.get('http://localhost:5000/api/orders', {
      headers: { 
        Authorization: `Bearer ${auth.token}` // Передаем токен в заголовке
      }
    });
    return response.data; // Возвращаем массив заказов с сервера
  }
);

// Создание slice для управления заказами
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],     // Массив заказов пользователя
    status: 'idle', // Статус загрузки: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null     // Сообщение об ошибке
  },
  reducers: {
    // Добавление нового заказа (локально, без API)
    addOrder: (state, action) => {
      state.items.push(action.payload);
    },
    // Очистка списка заказов
    clearOrders: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка начала загрузки заказов
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      
      // Успешная загрузка заказов
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Преобразование данных заказов:
        const orders = action.payload
          .map((order, index) => ({
            // Нормализация структуры заказа:
            id: order.id,
            orderNumber: action.payload.length - index, // Генерация номера заказа
            userId: order.user_id,
            address: order.address,
            name: order.name,
            total: order.total,
            created_at: order.created_at,
            delivery_date: order.delivery_date,
            items: order.items
          }))
          // Фильтрация - только заказы за последние 6 часов (21600000 мс)
          .filter(order => 
            new Date(order.created_at) > Date.now() - 21600000
          );

        state.items = orders;
      })
      
      // Ошибка загрузки заказов
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

// Экспорт действий и редюсера
export const { addOrder, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;