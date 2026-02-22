import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from localStorage on app boot
const tokenFromStorage = localStorage.getItem('colorCrewToken') || null;
const userFromStorage = localStorage.getItem('colorCrewUser')
  ? JSON.parse(localStorage.getItem('colorCrewUser'))
  : null;

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  isAuthenticated: !!tokenFromStorage,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem('colorCrewToken', token);
      localStorage.setItem('colorCrewUser', JSON.stringify(user));
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('colorCrewToken');
      localStorage.removeItem('colorCrewUser');
    },

    setAuthLoading(state, action) {
      state.isLoading = action.payload;
    },

    setAuthError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearAuthError(state) {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  logout,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;

// ─── SELECTORS ──────────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;