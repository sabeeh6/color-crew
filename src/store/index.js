import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from './slices/canvasSlice';
import toolReducer from './slices/toolSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import { sketchApi } from './api/sketchApi';
import { authApi } from './api/authApi';

export const store = configureStore({
  reducer: {
    // Feature slices
    canvas: canvasReducer,
    tool: toolReducer,
    auth: authReducer,
    ui: uiReducer,

    // RTK Query API reducers (auto-generated)
    [sketchApi.reducerPath]: sketchApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Fabric.js Canvas instance is not serializable — ignore it in checks
      serializableCheck: {
        ignoredActions: ['canvas/setCanvasInstance'],
        ignoredPaths: ['canvas.instance'],
      },
    })
      .concat(sketchApi.middleware)
      .concat(authApi.middleware),
});

// TypeScript-ready export types (useful if you migrate to TS later)
// export type RootState = ReturnType;
// export type AppDispatch = typeof store.dispatch;
