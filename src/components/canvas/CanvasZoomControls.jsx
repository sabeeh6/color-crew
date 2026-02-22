import { useSelector } from 'react-redux';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { selectZoomLevel } from '../../store/slices/canvasSlice';
import { useZoom } from '../../hooks/useZoom';

const CanvasZoomControls = () => {
  const zoomLevel = useSelector(selectZoomLevel);
  const { zoomIn, zoomOut, zoomReset } = useZoom();

  return (
    <div className="absolute bottom-4 right-4 z-30
                    flex items-center gap-1
                    bg-neutral-900/90 backdrop-blur rounded-xl
                    border border-neutral-800 px-2 py-1.5 shadow-xl">
      <button
        onClick={zoomOut}
        title="Zoom out"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-neutral-400 hover:text-white hover:bg-neutral-800
                   transition-colors"
      >
        <ZoomOut size={14} />
      </button>

      <button
        onClick={zoomReset}
        title="Reset zoom"
        className="px-2 text-xs text-neutral-300 hover:text-violet-400
                   font-mono transition-colors min-w-[3.5rem] text-center"
      >
        {Math.round(zoomLevel * 100)}%
      </button>

      <button
        onClick={zoomIn}
        title="Zoom in"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-neutral-400 hover:text-white hover:bg-neutral-800
                   transition-colors"
      >
        <ZoomIn size={14} />
      </button>

      <div className="w-px h-4 bg-neutral-700 mx-0.5" />

      <button
        onClick={zoomReset}
        title="Fit to screen"
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-neutral-400 hover:text-white hover:bg-neutral-800
                   transition-colors"
      >
        <Maximize2 size={14} />
      </button>
    </div>
  );
};

export default CanvasZoomControls;
