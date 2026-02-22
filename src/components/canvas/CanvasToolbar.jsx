import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Undo2, Redo2, Save, Download, FileText,
  Trash2, Palette, Loader2
} from 'lucide-react';
import {
  selectCanUndo,
  selectCanRedo,
  selectSketchTitle,
  selectIsSaving,
  selectCurrentSketchId,
  setSketchTitle,
} from '../../store/slices/canvasSlice';
import { useUndoRedo }  from '../../hooks/useUndoRedo';
import { useExport }    from '../../hooks/useExport';
import { useDrawingTools } from '../../hooks/useDrawingTools';
import { openModal }    from '../../store/slices/uiSlice';

const CanvasToolbar = () => {
  const dispatch   = useDispatch();
  const canUndo    = useSelector(selectCanUndo);
  const canRedo    = useSelector(selectCanRedo);
  const isSaving   = useSelector(selectIsSaving);
  const title      = useSelector(selectSketchTitle);
  const sketchId   = useSelector(selectCurrentSketchId);

  const { undo, redo }          = useUndoRedo();
  const { exportPNG, exportPDF, saveToCloud } = useExport();
  const { clearCanvas }         = useDrawingTools();

  const btnBase = `
    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
    transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
  `;

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="h-14 bg-neutral-900 border-b border-neutral-800
                 flex items-center justify-between px-4 gap-3 z-40 shrink-0"
    >
      {/* ── Left: Brand + Title ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-violet-600 rounded-md flex items-center justify-center">
          <Palette size={14} className="text-white" />
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => dispatch(setSketchTitle(e.target.value))}
          className="bg-transparent text-white text-sm font-semibold
                     border-b border-transparent hover:border-neutral-600
                     focus:border-violet-500 focus:outline-none
                     transition-colors px-1 w-44 truncate"
          placeholder="Untitled Sketch"
          maxLength={60}
        />
      </div>

      {/* ── Center: Undo / Redo / Clear ──────────────────────────────── */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo  (Ctrl+Z)"
          className={`${btnBase} text-neutral-300 hover:bg-neutral-800 hover:text-white`}
        >
          <Undo2 size={15} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo  (Ctrl+Y)"
          className={`${btnBase} text-neutral-300 hover:bg-neutral-800 hover:text-white`}
        >
          <Redo2 size={15} />
        </button>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        <button
          onClick={() => dispatch(openModal('clear-confirm'))}
          title="Clear canvas"
          className={`${btnBase} text-neutral-400 hover:bg-red-900/40 hover:text-red-400`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* ── Right: Save + Export ─────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={exportPNG}
          title="Export PNG"
          className={`${btnBase} text-neutral-300 hover:bg-neutral-800 hover:text-white`}
        >
          <Download size={15} />
          <span className="hidden sm:inline">PNG</span>
        </button>

        <button
          onClick={exportPDF}
          title="Export PDF"
          className={`${btnBase} text-neutral-300 hover:bg-neutral-800 hover:text-white`}
        >
          <FileText size={15} />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={() => saveToCloud(sketchId)}
          disabled={isSaving}
          title="Save to cloud"
          className={`${btnBase} bg-violet-600 hover:bg-violet-500 text-white`}
        >
          {isSaving
            ? <Loader2 size={15} className="animate-spin" />
            : <Save size={15} />
          }
          <span className="hidden sm:inline">
            {isSaving ? 'Saving…' : 'Save'}
          </span>
        </button>
      </div>
    </motion.header>
  );
};

export default CanvasToolbar;
