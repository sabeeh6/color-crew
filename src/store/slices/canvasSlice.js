import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTool: 'select',        // 'select' | 'pencil' | 'spray' | 'circle-brush' | 
                               // 'eraser' | 'rect' | 'circle' | 'triangle' | 
                               // 'line' | 'text'
  isDrawingMode: false,
  canUndo: false,
  canRedo: false,
  historyLength: 0,
  currentSketchId: null,       // MongoDB _id of the currently open sketch
  sketchTitle: 'Untitled Sketch',
  isSaving: false,
  lastSavedAt: null,
  zoomLevel: 1,                // Current zoom percentage
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setActiveTool(state, action) {
      state.activeTool = action.payload;
      // Automatically set drawing mode flag based on tool
      const drawingTools = ['pencil', 'spray', 'circle-brush', 'eraser'];
      state.isDrawingMode = drawingTools.includes(action.payload);
    },

    setCanUndo(state, action) {
      state.canUndo = action.payload;
    },

    setCanRedo(state, action) {
      state.canRedo = action.payload;
    },

    setHistoryLength(state, action) {
      state.historyLength = action.payload;
    },

    setCurrentSketchId(state, action) {
      state.currentSketchId = action.payload;
    },

    setSketchTitle(state, action) {
      state.sketchTitle = action.payload;
    },

    setIsSaving(state, action) {
      state.isSaving = action.payload;
    },

    setLastSavedAt(state, action) {
      state.lastSavedAt = action.payload;
    },

    setZoomLevel(state, action) {
      state.zoomLevel = action.payload;
    },

    resetCanvasState(state) {
      return { ...initialState };
    },
  },
});

export const {
  setActiveTool,
  setCanUndo,
  setCanRedo,
  setHistoryLength,
  setCurrentSketchId,
  setSketchTitle,
  setIsSaving,
  setLastSavedAt,
  setZoomLevel,
  resetCanvasState,
} = canvasSlice.actions;

export default canvasSlice.reducer;

// ─── SELECTORS ──────────────────────────────────────────────────────────────
export const selectActiveTool = (state) => state.canvas.activeTool;
export const selectIsDrawingMode = (state) => state.canvas.isDrawingMode;
export const selectCanUndo = (state) => state.canvas.canUndo;
export const selectCanRedo = (state) => state.canvas.canRedo;
export const selectCurrentSketchId = (state) => state.canvas.currentSketchId;
export const selectSketchTitle = (state) => state.canvas.sketchTitle;
export const selectIsSaving = (state) => state.canvas.isSaving;
export const selectZoomLevel = (state) => state.canvas.zoomLevel;
