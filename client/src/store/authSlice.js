// Slice для управления состоянием аутентификации
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,         // Данные пользователя
    token: null,        // JWT токен
    isAuthenticated: false, // Флаг авторизации
    loading: false,     // Флаг загрузки
    error: null         // Ошибки аутентификации
  },
  reducers: {
    // Начало процесса входа
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    // Успешный вход
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      // Сохраняем в localStorage
      localStorage.setItem('token', action.payload.token); 
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    // Ошибка входа
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Начало регистрации
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    
    // Успешная регистрация
    registerSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      // Сохраняем в localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    
    // Ошибка регистрации
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Выход из системы
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Очищаем localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearCartDB(); // Очищаем корзину
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearCartDB.rejected, (state) => {
        console.error('Ошибка очистки корзины при выходе');
      });
  }
});

// Вспомогательная функция для проверки JWT токена
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT decode error:', e);
    return null;
  }
};

// Thunk для проверки авторизации при загрузке приложения
export const checkAuth = () => (dispatch) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (token && user) {
    try {
      const decoded = decodeJWT(token);
      // Проверяем срок действия токена
      if (decoded && decoded.exp * 1000 > Date.now()) {
        dispatch(loginSuccess({ user, token }));
      } else {
        dispatch(logout());
      }
    } catch (e) {
      console.error('Token decode error:', e);
      dispatch(logout());
    }
  }
};

// Экспорт действий и редюсера
export const { 
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout
} = authSlice.actions;

export default authSlice.reducer;