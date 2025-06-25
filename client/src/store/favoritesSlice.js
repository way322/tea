import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchFavorites = createAsyncThunk(
  'favorites/fetch',
  async (_, { getState }) => {
    const { auth } = getState();
    const response = await axios.get(
      'http://localhost:5000/api/favorites',
      {
        headers: {
          Authorization: `Bearer ${auth.token}` 
        }
      }
    );
    return response.data;
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async (productId, { getState }) => {
    const { auth } = getState();
    const response = await axios.post(
      'http://localhost:5000/api/favorites/toggle',
      { productId },
      {
        headers: {
          Authorization: `Bearer ${auth.token}` 
        }
      }
    );
    return { productId, action: response.data.action };
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    loading: false,
    error: null
  },reducers: {
    clearFavorites(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload.action === 'removed') {
          state.items = state.items.filter(id => id !== action.payload.productId);
        } else {
          state.items.push(action.payload.productId);
        }
      });
  }
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;