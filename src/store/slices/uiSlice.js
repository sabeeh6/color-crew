import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isToolsPanelOpen: true,
  isPropertiesPanelOpen: true,
  isLayersPanelOpen: false,
  isExportModalOpen: false,
  isSaveModalOpen: false,
  isAiPanelOpen: false,
  activeModal: null,           // 'export' | 'save' | 'clear-confirm' | null
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleToolsPanel(state) {
      state.isToolsPanelOpen = !state.isToolsPanelOpen;
    },
    togglePropertiesPanel(state) {
      state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen;
    },
    toggleLayersPanel(state) {
      state.isLayersPanelOpen = !state.isLayersPanelOpen;
    },
    toggleAiPanel(state) {
      state.isAiPanelOpen = !state.isAiPanelOpen;
    },
    openModal(state, action) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const {
  toggleToolsPanel,
  togglePropertiesPanel,
  toggleLayersPanel,
  toggleAiPanel,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;

// ─── SELECTORS ──────────────────────────────────────────────────────────────
export const selectIsToolsPanelOpen = (state) => state.ui.isToolsPanelOpen;
export const selectIsPropertiesPanelOpen = (state) => state.ui.isPropertiesPanelOpen;
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectIsAiPanelOpen = (state) => state.ui.isAiPanelOpen;