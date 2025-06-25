import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (_, { getState }) => {
    const { auth } = getState();
    const response = await axios.get('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    addOrder: (state, action) => {
      state.items.push(action.payload);
    },
    clearOrders: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const orders = action.payload
          .map((order, index) => ({
            id: order.id,
            orderNumber: action.payload.length - index, 
            userId: order.user_id,
            address: order.address,
            name: order.name,
            total: order.total,
            created_at: order.created_at,
            delivery_date: order.delivery_date,
            items: order.items
          }))
          .filter(order => 
            new Date(order.created_at) > Date.now() - 21600000
          );

        state.items = orders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { addOrder, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;