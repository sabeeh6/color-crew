import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  unreadCount: 0,
  isOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload);
      if (!state.isOpen) {
        state.unreadCount += 1;
      }
    },
    setIsOpen(state, action) {
      state.isOpen = action.payload;
      if (action.payload) {
        state.unreadCount = 0;
      }
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
      state.unreadCount = 0;
    },
  },
});

export const { addMessage, setIsOpen, setMessages, clearMessages } = chatSlice.actions;

export const selectChatMessages = (state) => state.chat?.messages || [];
export const selectChatUnreadCount = (state) => state.chat?.unreadCount || 0;
export const selectIsChatOpen = (state) => state.chat?.isOpen || false;

export default chatSlice.reducer;
