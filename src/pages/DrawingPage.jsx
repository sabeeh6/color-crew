import { useEffect, useCallback } from 'react';
import { useParams }       from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';

// Canvas components
import FabricCanvas       from '../components/canvas/FabricCanvas';
import CanvasToolbar      from '../components/canvas/CanvasToolbar';
import CanvasZoomControls from '../components/canvas/CanvasZoomControls';

// Tool + Property panels
import ToolsPanel         from '../components/tools/ToolsPanel';
import PropertiesPanel    from '../components/panels/PropertiesPanel';

// Redux
import {
  selectIsToolsPanelOpen,
  selectIsPropertiesPanelOpen,
  selectActiveModal,
  closeModal,
} from '../store/slices/uiSlice';
import {
  setCurrentSketchId,
  setSketchTitle,
  selectCurrentSketchId,
} from '../store/slices/canvasSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

// Hooks
import { useExport }      from '../hooks/useExport';
import { useUndoRedo }    from '../hooks/useUndoRedo';
import { useDrawingTools } from '../hooks/useDrawingTools';

// RTK Query
import { useGetSketchByIdQuery } from '../store/api/sketchApi';

import toast from 'react-hot-toast';

import { socket } from '../utils/socket';
import RoomFullError from '../components/ui/RoomFullError';
import { useState, useRef } from 'react';
import ChatPanel from '../components/chat/ChatPanel';
import { addMessage, selectIsChatOpen } from '../store/slices/chatSlice';
import CanvasReactions from '../components/canvas/CanvasReactions';

// ─── Clear Confirm Modal ──────────────────────────────────────────────────────
const ClearConfirmModal = ({ onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
               flex items-center justify-center px-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1,   opacity: 1 }}
      exit={{ scale: 0.9,    opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-neutral-900 border border-neutral-800 rounded-2xl
                 p-6 w-full max-w-sm shadow-2xl"
    >
      <h2 className="text-white font-bold text-lg mb-2">Clear Canvas?</h2>
      <p className="text-neutral-500 text-sm mb-6">
        This will remove all objects from the canvas. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-neutral-700
                     text-neutral-300 hover:bg-neutral-800 text-sm font-medium
                     transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500
                     text-white text-sm font-medium transition-colors"
        >
          Clear
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Floating Reaction Component ─────────────────────────────────────────────
const FloatingReaction = ({ reaction, onComplete }) => {
  const isComment = reaction.comment !== null && reaction.comment !== undefined;

  // Calculate how far to travel to reach the vertical middle of the screen
  const travelToMiddle = reaction.y - (window.innerHeight / 2);
  // Calculate how far to travel to reach near the top of the screen (with padding)
  const travelToTop = reaction.y - 120;

  if (isComment) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ 
          opacity: [0, 1, 1, 1, 0],
          scale: [0.8, 1, 1, 1, 0.9],
          y: -travelToMiddle 
        }}
        transition={{ 
          duration: 10, 
          times: [0, 0.05, 0.5, 0.92, 1],
          ease: "easeOut" 
        }}
        onAnimationComplete={onComplete}
        style={{ left: reaction.x, top: reaction.y }}
        className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col items-center z-50"
      >
        <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 max-w-xs backdrop-blur-md">
          {reaction.emoji && <span className="text-sm select-none">{reaction.emoji}</span>}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">{reaction.username}</span>
            <span className="text-[11px] text-white leading-tight font-medium">{reaction.comment}</span>
          </div>
        </div>
        {/* Little bubble pointer arrow */}
        <div className="w-2.5 h-2.5 bg-neutral-900 border-r border-b border-neutral-800 rotate-45 -mt-1.5" />
      </motion.div>
    );
  }

  // Pure emoji reaction — floats all the way to the top of the screen
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4, y: 10, x: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.4, 1.3, 1, 0.7],
        y: -travelToTop,
        x: [0, -15, 15, -10, 10, 0]
      }}
      transition={{ 
        duration: 3.5,
        times: [0, 0.1, 0.8, 1],
        ease: "easeOut" 
      }}
      onAnimationComplete={onComplete}
      style={{ left: reaction.x, top: reaction.y }}
      className="fixed pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-50 select-none"
    >
      <div className="text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">{reaction.emoji}</div>
      <span className="bg-neutral-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-neutral-800 shadow-md mt-1 scale-75 whitespace-nowrap backdrop-blur-sm">
        {reaction.username}
      </span>
    </motion.div>
  );
};

// ─── DrawingPage ──────────────────────────────────────────────────────────────
const DrawingPage = () => {
  const dispatch   = useDispatch();
  const { sketchId } = useParams(); // undefined → new sketch

  const isToolsPanelOpen      = useSelector(selectIsToolsPanelOpen);
  const isPropertiesPanelOpen = useSelector(selectIsPropertiesPanelOpen);
  const activeModal           = useSelector(selectActiveModal);
  const currentSketchId       = useSelector(selectCurrentSketchId);
  const isChatOpen            = useSelector(selectIsChatOpen);

  const { loadFromJSON }  = useExport();
  const { clearCanvas }   = useDrawingTools();
  const [isRoomFull, setIsRoomFull] = useState(false);
  const [cursors, setCursors] = useState({});
  const [reactions, setReactions] = useState([]);
  const myMousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const reactionIdCounter = useRef(0);

  const currentUser = useSelector(selectCurrentUser);
  const username = currentUser?.name || currentUser?.username || 'Guest';

  // ── Load existing sketch if sketchId param is present ─────────────────────
  const { data: sketchData, isLoading: loadingSketch } =
    useGetSketchByIdQuery(sketchId, { skip: !sketchId });

  useEffect(() => {
    console.log("🟡 DrawingPage UseEffect triggered");
    console.log("🟡 SketchData:", sketchData);
    
    // Backend returns the sketch document directly, NOT nested in a { sketch: ... } object
    if (sketchData && sketchData._id) {
      const { _id, title, fabricJSON } = sketchData;
      
      console.log("🟠 Found Sketch ID:", _id, "Current Redux ID:", currentSketchId);
      
      // ONLY load if this is a different sketch or initial load
      if (_id !== currentSketchId) {
        console.log("🟢 Setting up Redux and planning to load JSON into Canvas...");
        dispatch(setCurrentSketchId(_id));
        dispatch(setSketchTitle(title));

        const timer = setTimeout(() => {
          console.log("🔵 Timer fired. Loading JSON into canvas!");
          loadFromJSON(fabricJSON).catch(e => console.error("🔴 Error loading JSON inside Fabric:", e));
          toast.success("Sketch loaded successfully!");
        }, 500); // increased timer slightly to ensure canvas is mounted
        
      }
    }
  }, [sketchData, dispatch, loadFromJSON, currentSketchId]);

  // ── Socket Connection & Collaboration ─────────────────────────────────────
  useEffect(() => {
    if (!sketchId) return;

    socket.connect();
    
    socket.emit("join-room", sketchId, (response) => {
      if (!response.success && response.message === "Room is full") {
        setIsRoomFull(true);
      }
    });

    const handleCanvasUpdate = (fabricJSON) => {
      // Temporarily disable undo/redo saving while remote changes load
      window.__isRemoteUpdate = true;
      loadFromJSON(fabricJSON).finally(() => {
        window.__isRemoteUpdate = false;
      });
    };

    const handleCursorMove = (data) => {
      if (data.socketId === socket.id) return;
      setCursors((prev) => ({ ...prev, [data.socketId]: data }));
    };

    const handleUserDisconnected = (socketId) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    };

    const handleChatMessage = (data) => {
      // Only add if it's from someone else (since we add locally for ourselves)
      if (data.sender !== username) {
        dispatch(addMessage(data));
      }
    };

    const handleReaction = (data) => {
      // Ensure every incoming reaction has a unique local id for React rendering
      const reactionWithId = {
        ...data,
        id: data.id || `remote-${Date.now()}-${++reactionIdCounter.current}`
      };
      setReactions((prev) => [...prev, reactionWithId]);
    };

    socket.on("on-canvas-update", handleCanvasUpdate);
    socket.on("on-cursor-move", handleCursorMove);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("on-chat-message", handleChatMessage);
    socket.on("on-reaction", handleReaction);

    return () => {
      socket.off("on-canvas-update", handleCanvasUpdate);
      socket.off("on-cursor-move", handleCursorMove);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("on-chat-message", handleChatMessage);
      socket.off("on-reaction", handleReaction);
      socket.disconnect();
    };
  }, [sketchId, loadFromJSON]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    const isTyping =
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (isTyping) return;

    // Ctrl+Z → undo / Ctrl+Y or Ctrl+Shift+Z → redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      // undo is dispatched via CanvasToolbar button — fire the same action
      document.dispatchEvent(new CustomEvent('canvas:undo'));
    }
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'y' || (e.key === 'z' && e.shiftKey))
    ) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('canvas:redo'));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup Sketch ID on unmount so clicking the same sketch again reloads it
  useEffect(() => {
    return () => {
      dispatch(setCurrentSketchId(null));
      dispatch(setSketchTitle('Untitled Sketch'));
    };
  }, [dispatch]);

  // ── Handle clear confirm modal ─────────────────────────────────────────────
  const handleClearConfirm = () => {
    clearCanvas();
    dispatch(closeModal());
    toast.success('Canvas cleared');
  };

  if (isRoomFull) {
    return <RoomFullError />;
  }

  const handleMouseMove = (e) => {
    myMousePos.current = { x: e.clientX, y: e.clientY };
    if (!sketchId || !socket.connected) return;
    socket.emit("cursor-move", {
      roomId: sketchId,
      socketId: socket.id,
      username,
      x: e.clientX,
      y: e.clientY
    });
  };

  const sendReaction = ({ emoji, comment }) => {
    if (!sketchId) return;

    const uniqueId = `local-${Date.now()}-${++reactionIdCounter.current}`;

    const reactionData = {
      id: uniqueId,
      roomId: sketchId,
      socketId: socket.id,
      emoji,
      comment,
      username,
      x: myMousePos.current.x,
      y: myMousePos.current.y
    };

    // Trigger locally
    setReactions((prev) => [...prev, reactionData]);

    // Send to other users in the room
    if (socket.connected) {
      socket.emit("send-reaction", reactionData);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 relative"
      onMouseMove={handleMouseMove}
    >
      {/* ── Render Floating Reactions ── */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {reactions.map((r) => (
          <FloatingReaction
            key={r.id}
            reaction={r}
            onComplete={() => {
              setReactions((prev) => prev.filter((item) => item.id !== r.id));
            }}
          />
        ))}
      </div>

      {/* ── Render Cursors ── */}
      {Object.values(cursors).map((c) => (
        <div
          key={c.socketId}
          className="pointer-events-none fixed z-50 transition-all duration-75 ease-linear"
          style={{ left: c.x, top: c.y }}
        >
          <svg width="20" height="20" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7871 12.3673H5.65376Z" fill="#a78bfa" stroke="white" strokeWidth="2"/>
          </svg>
          <div className="bg-violet-500 text-white text-xs px-2 py-1 rounded shadow-md mt-1 ml-3 whitespace-nowrap">
            {c.username}
          </div>
        </div>
      ))}

      {/* ── Top Toolbar ──────────────────────────────────────────────── */}
      <CanvasToolbar />

      {/* ── Main Editor Area ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Tools Panel */}
        <AnimatePresence>
          {isToolsPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 64, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden shrink-0"
            >
              <ToolsPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: The Fabric.js Canvas */}
        <div className="relative flex-1 h-full w-full overflow-hidden">
          {loadingSketch ? (
            <div className="absolute inset-0 flex items-center justify-center
                            bg-neutral-950 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-neutral-800
                                border-t-violet-500 rounded-full animate-spin" />
                <span className="text-neutral-600 text-sm">Loading sketch…</span>
              </div>
            </div>
          ) : (
            <FabricCanvas />
          )}

          {/* Ephemeral Canvas Reactions Component */}
          <CanvasReactions onSendReaction={sendReaction} />

          {/* Zoom Controls (absolute bottom-right of canvas area) */}
          <CanvasZoomControls />
        </div>


        {/* Right Area: Properties or Chat Sidebar */}
        <AnimatePresence mode="wait">
          {isPropertiesPanelOpen && !isChatOpen && (
            <motion.div
              key="properties-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden shrink-0 border-l border-neutral-800"
            >
              <PropertiesPanel />
            </motion.div>
          )}

          {isChatOpen && !isPropertiesPanelOpen && (
            <motion.div
              key="chat-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden shrink-0 border-l border-neutral-800"
            >
              <ChatPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeModal === 'clear-confirm' && (
          <ClearConfirmModal
            onConfirm={handleClearConfirm}
            onCancel={() => dispatch(closeModal())}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawingPage;
