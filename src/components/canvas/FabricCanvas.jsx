import { useCanvas }       from '../../hooks/useCanvas';
import { useCanvasEvents }  from '../../hooks/useCanvasEvents';
import { useZoom }          from '../../hooks/useZoom';

/**
 * FabricCanvas
 * Mounts the Fabric.js <canvas> element.
 * Calls useCanvas (init), useCanvasEvents (event bridge), useZoom (wheel + pan).
 * The canvas-container div has touch-action:none to hand pointer events
 * fully to Fabric.js on tablets and touch screens.
 */
const FabricCanvas = () => {
  const { canvasElRef } = useCanvas();
  useCanvasEvents();
  useZoom();

  return (
    <div
      className="relative flex-1 overflow-hidden bg-neutral-200 checkerboard canvas-container"
      style={{ touchAction: 'none' }}
    >
      <canvas ref={canvasElRef} className="shadow-2xl" />
    </div>
  );
};

export default FabricCanvas;
