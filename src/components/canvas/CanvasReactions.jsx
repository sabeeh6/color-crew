import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Send, MessageSquare } from 'lucide-react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '🎉', '👏'];

const CanvasReactions = ({ onSendReaction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close when clicking outside the panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCommentInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus comment input when opened
  useEffect(() => {
    if (showCommentInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCommentInput]);

  const handleEmojiClick = (emoji) => {
    onSendReaction({ emoji, comment: null });
    // Keep it open for quick spamming of emojis, standard in collaboration tools
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onSendReaction({ emoji: '💬', comment: commentText.trim() });
    setCommentText('');
    setShowCommentInput(false);
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4 left-4 z-30 flex items-center gap-2"
    >
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) {
            setShowCommentInput(false);
          }
        }}
        title="Reactions & Comments"
        className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-xl transition-all border
          ${isOpen 
            ? 'bg-violet-600 border-violet-500 text-white' 
            : 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white backdrop-blur'
          }`}
      >
        <Smile size={20} className={isOpen ? 'animate-bounce' : ''} />
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur rounded-xl border border-neutral-800 p-1.5 shadow-xl"
          >
            {/* Emoji Selection List */}
            <div className="flex items-center gap-0.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-neutral-800 active:scale-90 transition-all select-none"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-neutral-800 mx-1 shrink-0" />

            {/* Comment Option Toggle */}
            {!showCommentInput ? (
              <button
                onClick={() => setShowCommentInput(true)}
                title="Add floating comment"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-violet-400 hover:bg-neutral-800 transition-colors shrink-0"
              >
                <MessageSquare size={16} />
              </button>
            ) : (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 180, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-1 overflow-hidden"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Floating comment..."
                  maxLength={50}
                  className="w-full bg-neutral-950/50 text-white text-[11px] rounded-lg px-2.5 py-1.5 border border-neutral-800 focus:border-violet-500 focus:outline-none transition-all placeholder:text-neutral-600"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-30 disabled:hover:bg-violet-600 transition-all shrink-0 cursor-pointer"
                >
                  <Send size={12} />
                </button>
              </motion.form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanvasReactions;
