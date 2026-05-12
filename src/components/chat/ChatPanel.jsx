import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Users, Minus } from 'lucide-react';
import { 
  selectChatMessages, 
  selectChatUnreadCount, 
  selectIsChatOpen, 
  setIsOpen, 
  addMessage,
  setMessages,
  clearMessages
} from '../../store/slices/chatSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { socket } from '../../utils/socket';
import { useParams } from 'react-router-dom';
import { useGetChatHistoryQuery } from '../../store/api/chatApi';

const ChatPanel = () => {
  const dispatch = useDispatch();
  const { sketchId } = useParams();
  const messages = useSelector(selectChatMessages);
  const isOpen = useSelector(selectIsChatOpen);
  const currentUser = useSelector(selectCurrentUser);
  
  // RTK Query for history
  const { data: historyData, isLoading: isLoadingHistory } = useGetChatHistoryQuery(sketchId, {
    skip: !sketchId,
    refetchOnMountOrArgChange: true
  });
  
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  const username = currentUser?.name || currentUser?.username || 'Guest';

  // Load history into Redux when fetched
  useEffect(() => {
    if (historyData?.success && historyData?.data) {
      dispatch(setMessages(historyData.data));
    }
  }, [historyData, dispatch]);

  // Clear messages when leaving the sketch
  useEffect(() => {
    return () => {
      // We don't necessarily want to clear if just closing sidebar, 
      // but maybe when leaving the page entirely? 
      // For now, let's keep them in Redux until sketchId changes.
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !sketchId) return;

    const messageData = {
      roomId: sketchId,
      sender: username,
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Emit to socket
    socket.emit('send-chat-message', messageData);
    
    // Add locally immediately for better UX
    dispatch(addMessage(messageData));
    setInputValue('');
  };

  return (
    <motion.aside
      initial={{ x: 240, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      exit={{ x: 240, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-64 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-hidden z-30 shrink-0 shadow-2xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
          <MessageSquare size={14} className="text-violet-500" />
          Team Chat
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-neutral-800 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3 opacity-50">
            <MessageSquare size={32} />
            <p className="text-[11px] font-medium text-center px-4">
              Communication is key! Start a conversation with your team.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === username;
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-neutral-500 mb-1 px-1 font-semibold uppercase tracking-tighter">
                  {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'bg-neutral-800 text-neutral-300 rounded-tl-none border border-neutral-700/50'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-950/30 border-t border-neutral-800">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Send a message..."
            className="w-full bg-neutral-800/50 text-white text-xs rounded-xl px-4 py-3 pr-10 border border-neutral-700 focus:border-violet-500 focus:bg-neutral-800 focus:outline-none transition-all placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-violet-500 hover:text-violet-400 disabled:opacity-20 transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </motion.aside>
  );
};

export default ChatPanel;
