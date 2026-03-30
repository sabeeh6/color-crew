import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  strokeColor: '#1a1a1a',
  fillColor: 'transparent',
  strokeWidth: 3,
  opacity: 1,
  brushDensity: 30,       // for spray brush
  fontSize: 20,
  fontFamily: 'Arial',

  // Professional styling (Shadow only)
  shadowEnabled: false,
  shadowColor: 'rgba(0,0,0,0.4)',
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
};


const toolSlice = createSlice({
  name: 'tool',
  initialState,
  reducers: {
    setStrokeColor(state, action) {
      state.strokeColor = action.payload;
    },
    setFillColor(state, action) {
      state.fillColor = action.payload;
    },
    setStrokeWidth(state, action) {
      state.strokeWidth = action.payload;
    },
    setOpacity(state, action) {
      state.opacity = action.payload;
    },
    setBrushDensity(state, action) {
      state.brushDensity = action.payload;
    },
    setFontSize(state, action) {
      state.fontSize = action.payload;
    },
    setFontFamily(state, action) {
      state.fontFamily = action.payload;
    },
    setShadowEnabled(state, action) {
      state.shadowEnabled = action.payload;
    },
    setShadowColor(state, action) {
      state.shadowColor = action.payload;
    },
    setShadowBlur(state, action) {
      state.shadowBlur = action.payload;
    },
    setShadowOffsetX(state, action) {
      state.shadowOffsetX = action.payload;
    },
    setShadowOffsetY(state, action) {
      state.shadowOffsetY = action.payload;
    },
    resetToolSettings(state) {
      return { ...initialState };
    },
  },
});

export const {
  setStrokeColor,
  setFillColor,
  setStrokeWidth,
  setOpacity,
  setBrushDensity,
  setFontSize,
  setFontFamily,
  setShadowEnabled,
  setShadowColor,
  setShadowBlur,
  setShadowOffsetX,
  setShadowOffsetY,
  resetToolSettings,
} = toolSlice.actions;

export default toolSlice.reducer;
export const selectStrokeColor = (state) => state.tool.strokeColor;
export const selectFillColor = (state) => state.tool.fillColor;
export const selectStrokeWidth = (state) => state.tool.strokeWidth;
export const selectOpacity = (state) => state.tool.opacity;
export const selectBrushDensity = (state) => state.tool.brushDensity;
export const selectFontSize = (state) => state.tool.fontSize;
export const selectFontFamily = (state) => state.tool.fontFamily;
export const selectShadowEnabled = (state) => state.tool.shadowEnabled;
export const selectShadowColor = (state) => state.tool.shadowColor;
export const selectShadowBlur = (state) => state.tool.shadowBlur;
export const selectShadowOffsetX = (state) => state.tool.shadowOffsetX;
export const selectShadowOffsetY = (state) => state.tool.shadowOffsetY;
