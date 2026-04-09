import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from sessionStorage on app boot
const tokenFromStorage = sessionStorage.getItem('colorCrewToken') || null;
let userFromStorage = null;
try {
  const storedUser = sessionStorage.getItem('colorCrewUser');
  if (storedUser && storedUser !== 'undefined') {
    userFromStorage = JSON.parse(storedUser);
  }
} catch (error) {
  console.error('Failed to parse user from sessionStorage:', error);
}


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
      // Persist to sessionStorage so it clears on tab close
      sessionStorage.setItem('colorCrewToken', token);
      sessionStorage.setItem('colorCrewUser', JSON.stringify(user));
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('colorCrewToken');
      sessionStorage.removeItem('colorCrewUser');
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