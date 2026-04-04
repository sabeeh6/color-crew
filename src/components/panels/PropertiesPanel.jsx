// src/components/panels/PropertiesPanel.jsx
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { 
  Box, Shield, Sun, MousePointer2
} from 'lucide-react';
import {
  selectStrokeColor,
  selectFillColor,
  selectStrokeWidth,
  selectOpacity,
  selectBrushDensity,
  selectShadowEnabled,
  selectShadowColor,
  selectShadowBlur,
  selectShadowOffsetX,
  selectShadowOffsetY,
  setStrokeColor,
  setFillColor,
  setStrokeWidth,
  setOpacity,
  setBrushDensity,
  setShadowEnabled,
  setShadowColor,
  setShadowBlur,
  setShadowOffsetX,
  setShadowOffsetY,
} from '../../store/slices/toolSlice';
import { selectActiveTool } from '../../store/slices/canvasSlice';

const SectionTitle = ({ children, Icon }) => (
  <h3 className="text-neutral-500 text-[10px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
    {Icon && <Icon size={12} />}
    {children}
  </h3>
);

const SliderRow = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <div className="flex justify-between">
      <span className="text-neutral-400 text-xs">{label}</span>
      <span className="text-neutral-300 text-xs font-mono tabular-nums">
        {typeof value === 'number' && step < 1
          ? Math.round(value * 100) + '%'
          : value + unit
        }
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer bg-neutral-800"
    />
  </div>
);

const PropertiesPanel = () => {
  const dispatch = useDispatch();
  const activeTool = useSelector(selectActiveTool);

  // Selectors
  const strokeColor = useSelector(selectStrokeColor);
  const fillColor = useSelector(selectFillColor);
  const strokeWidth = useSelector(selectStrokeWidth);
  const opacity = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);
  const shadowEnabled = useSelector(selectShadowEnabled);
  const shadowColor = useSelector(selectShadowColor);
  const shadowBlur = useSelector(selectShadowBlur);
  const shadowOffsetX = useSelector(selectShadowOffsetX);
  const shadowOffsetY = useSelector(selectShadowOffsetY);

  const isBrushTool = [
    'pencil', 'ink', 'dip-pen', 'marker', 'chalk', 'watercolor',
    'hard-round', 'hair', 'ribbon', 
    'spray-dense', 'airbrush', 'circle-brush', 'eraser'
  ].includes(activeTool);
  const isSpray = ['spray-dense', 'airbrush'].includes(activeTool);
  const isShapeTool = [
    'rect', 'circle', 'triangle', 'line', 'star', 'heart', 
    'cloud', 'hexagon', 'ellipse', 'ring', 'arc'
  ].includes(activeTool);

  return (
    <motion.aside
      initial={{ x: 240, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      className="w-64 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full overflow-hidden z-30 shrink-0 shadow-2xl"
    >
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
          <Box size={14} className="text-violet-500" />
          Object Properties
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar pb-10">
        
        {/* ── Colors ──────────────────────────────────────────────────── */}
        <section className="space-y-6">
          {activeTool !== 'blend' && (
            <div>
              <SectionTitle Icon={Shield}>{isBrushTool ? 'Brush Color' : 'Stroke Color'}</SectionTitle>
              <HexColorPicker
                color={strokeColor}
                onChange={(c) => dispatch(setStrokeColor(c))}
                className="!w-full !h-32 mb-3"
              />
              <input
                type="text"
                value={strokeColor}
                onChange={(e) => dispatch(setStrokeColor(e.target.value))}
                className="w-full bg-neutral-800 text-neutral-200 text-xs font-mono rounded-lg px-3 py-2 border border-neutral-700 outline-none focus:border-violet-500 transition-all font-semibold"
              />
            </div>
          )}

          {isShapeTool && (
            <div>
              <SectionTitle Icon={Box}>Fill Color</SectionTitle>
              <HexColorPicker
                color={fillColor === 'transparent' ? '#ffffff' : fillColor}
                onChange={(c) => dispatch(setFillColor(c))}
                className="!w-full !h-32"
              />
              <button
                onClick={() => dispatch(setFillColor('transparent'))}
                className={`mt-3 w-full text-[10px] font-bold uppercase tracking-wider rounded-lg py-2 transition-all border ${
                  fillColor === 'transparent'
                    ? 'bg-violet-600/10 border-violet-500 text-violet-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300'
                }`}
              >
                No Fill (Transparent)
              </button>
            </div>
          )}
        </section>

        {/* ── Geometry ────────────────────────────────────────────────── */}
        <section>
          <SectionTitle Icon={Box}>Geometry</SectionTitle>
          <SliderRow
            label={isBrushTool ? 'Brush Size' : 'Stroke Width'}
            value={strokeWidth}
            min={1}
            max={80}
            unit="px"
            onChange={(v) => dispatch(setStrokeWidth(v))}
          />
          {isSpray && (
            <SliderRow
              label="Spray Density"
              value={brushDensity}
              min={5}
              max={80}
              onChange={(v) => dispatch(setBrushDensity(v))}
            />
          )}
          <SliderRow
            label={activeTool === 'blend' ? 'Mix Strength' : 'Opacity'}
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => dispatch(setOpacity(v))}
          />
        </section>

        {/* ── Effects (Shadow) ────────────────────────────────────────── */}
        <section className="bg-neutral-800/30 p-3 rounded-xl border border-neutral-800 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <SectionTitle Icon={Sun}>Drop Shadow</SectionTitle>
            <button
              onClick={() => dispatch(setShadowEnabled(!shadowEnabled))}
              className={`w-8 h-4 rounded-full transition-all duration-300 relative ${
                shadowEnabled ? 'bg-violet-600 shadow-lg shadow-violet-900/40' : 'bg-neutral-700'
              }`}
            >
              <motion.div
                animate={{ x: shadowEnabled ? 16 : 2 }}
                className="w-3 h-3 bg-white rounded-full absolute top-0.5"
              />
            </button>
          </div>

          <AnimatePresence>
            {shadowEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider">Shadow Color</span>
                    <input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => dispatch(setShadowColor(e.target.value))}
                      className="w-full h-8 bg-neutral-800 rounded cursor-pointer border border-neutral-700"
                    />
                  </div>
                  <SliderRow
                    label="Blur"
                    value={shadowBlur}
                    min={0}
                    max={50}
                    onChange={(v) => dispatch(setShadowBlur(v))}
                  />
                  <SliderRow
                    label="Offset X"
                    value={shadowOffsetX}
                    min={-50}
                    max={50}
                    onChange={(v) => dispatch(setShadowOffsetX(v))}
                  />
                  <SliderRow
                    label="Offset Y"
                    value={shadowOffsetY}
                    min={-50}
                    max={50}
                    onChange={(v) => dispatch(setShadowOffsetY(v))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Contextual Help ─────────────────────────────────────────── */}
        <div className="p-4 bg-violet-600/5 rounded-xl border border-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer2 size={12} className="text-violet-400" />
            <span className="text-violet-400 text-[10px] uppercase font-bold tracking-wider">Help</span>
          </div>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            {activeTool === 'select'  && 'Click objects to select. Drag to move.'}
            {activeTool === 'blend'   && 'Blender is active. Drag across colors to smudge them. No color picked needed!'}
            {isBrushTool && activeTool !== 'eraser' && activeTool !== 'blend' && 'Free-hand drawing is active. Adjust size and opacity below.'}
            {activeTool === 'eraser'  && 'Eraser is active. Click and drag to remove strokes.'}
            {isShapeTool              && 'Live shape properties are enabled. Change colors or add shadows!'}
            {!activeTool              && 'Select a tool from the sidebar to begin designing.'}
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </motion.aside>
  );
};

export default PropertiesPanel;
