import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const decrementQuantity = createAsyncThunk(
  'cart/decrement',
  async (productId, { getState, rejectWithValue }) => { 
    const { auth } = getState();
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/cart/${productId}/decrement`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
  }
);

export const syncCart = createAsyncThunk(
  'cart/sync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        throw new Error('No authentication token');
      }
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      return response.data.map(item => ({
        id: item.product_id,
        title: item.title,
        price: Number(item.price),
        image_url: item.image_url,
        quantity: item.quantity
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Unauthorized');
      }
      return rejectWithValue(error.message);
    }
  }
)

export const addToCartDB = createAsyncThunk(
  'cart/add',
  async (product, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        throw new Error('No authentication token');
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      return {
        ...product,
        quantity: response.data.newQuantity
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Unauthorized');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const initializeCart = createAsyncThunk(
  'cart/initialize',
  async (_, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      await dispatch(syncCart());
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart'));
      if (localCart?.items) return localCart;
    }
    return null;
  }
);

export const clearCartDB = createAsyncThunk(
  'cart/clear',
  async (_, { getState }) => {
    const { auth } = getState();
    await axios.delete('http://localhost:5000/api/cart/clear', {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
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
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        const { productId, removed, newQuantity } = action.payload;
        if (removed) {
          state.items = state.items.filter(item => item.id !== productId);
        } else {
          const item = state.items.find(i => i.id === productId);
          if (item) item.quantity = newQuantity;
        }
      })
      .addCase(decrementQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Ошибка обновления корзины';
        console.error('Decrement error:', action.payload);
      })
      .addCase(initializeCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.items || [];
        }
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(addToCartDB.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload.id);
        item ? item.quantity++ : state.items.push({ ...action.payload, quantity: 1 });
      })
      .addCase(clearCartDB.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(syncCart.rejected, (state) => {
        localStorage.setItem('cart', JSON.stringify(state));
      });

  }
});

export const { addToCart, clearCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;