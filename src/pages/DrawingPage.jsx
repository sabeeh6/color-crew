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

// Hooks
import { useExport }      from '../hooks/useExport';
import { useUndoRedo }    from '../hooks/useUndoRedo';
import { useDrawingTools } from '../hooks/useDrawingTools';

// RTK Query
import { useGetSketchByIdQuery } from '../store/api/sketchApi';

import toast from 'react-hot-toast';

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

// ─── DrawingPage ──────────────────────────────────────────────────────────────
const DrawingPage = () => {
  const dispatch   = useDispatch();
  const { sketchId } = useParams(); // undefined → new sketch

  const isToolsPanelOpen      = useSelector(selectIsToolsPanelOpen);
  const isPropertiesPanelOpen = useSelector(selectIsPropertiesPanelOpen);
  const activeModal           = useSelector(selectActiveModal);
  const currentSketchId       = useSelector(selectCurrentSketchId);

  const { loadFromJSON }  = useExport();
  const { clearCanvas }   = useDrawingTools();

  // ── Load existing sketch if sketchId param is present ─────────────────────
  const { data: sketchData, isLoading: loadingSketch } =
    useGetSketchByIdQuery(sketchId, { skip: !sketchId });

  useEffect(() => {
    if (sketchData?.sketch) {
      const { _id, title, fabricJSON } = sketchData.sketch;
      dispatch(setCurrentSketchId(_id));
      dispatch(setSketchTitle(title));

      // Small delay so FabricCanvas has time to mount and set singleton
      const timer = setTimeout(() => {
        loadFromJSON(fabricJSON);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [sketchData, dispatch, loadFromJSON]);

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

  // ── Handle clear confirm modal ─────────────────────────────────────────────
  const handleClearConfirm = () => {
    clearCanvas();
    dispatch(closeModal());
    toast.success('Canvas cleared');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950">

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
        <div className="relative flex-1 overflow-hidden">
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

          {/* Zoom Controls (absolute bottom-right of canvas area) */}
          <CanvasZoomControls />
        </div>

        {/* Right: Properties Panel */}
        <AnimatePresence>
          {isPropertiesPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden shrink-0"
            >
              <PropertiesPanel />
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
