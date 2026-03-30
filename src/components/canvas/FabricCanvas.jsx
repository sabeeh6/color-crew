import { useCanvas }       from '../../hooks/useCanvas';
import { useCanvasEvents }  from '../../hooks/useCanvasEvents';
import { useZoom }          from '../../hooks/useZoom';
import { useToolPropertiesSync } from '../../hooks/useToolPropertiesSync';

/**
 * FabricCanvas
 * Mounts the Fabric.js <canvas> element.
 * Calls useCanvas (init), useCanvasEvents (event bridge), useZoom (wheel + pan).
 * The fabric-canvas-wrapper div has touch-action:none to hand pointer events
 * fully to Fabric.js on tablets and touch screens.
 */
const FabricCanvas = () => {
  const { canvasElRef } = useCanvas();
  useCanvasEvents();
  useZoom();
  useToolPropertiesSync();

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-white fabric-canvas-wrapper"
      style={{ touchAction: 'none' }}
    >
      <canvas ref={canvasElRef} className="shadow-2xl" />
    </div>

  );
};


export default FabricCanvas;
