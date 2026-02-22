// // src/components/panels/PropertiesPanel.jsx
// import { useDispatch, useSelector } from 'react-redux';
// import { HexColorPicker } from 'react-colorful';
// import { motion } from 'framer-motion';
// import {
//   selectStrokeColor,
//   selectFillColor,
//   selectStrokeWidth,
//   selectOpacity,
//   setStrokeColor,
//   setFillColor,
//   setStrokeWidth,
//   setOpacity,
// } from '../../store/slices/toolSlice';

// const PropertiesPanel = () => {
//   const dispatch = useDispatch();
//   const strokeColor = useSelector(selectStrokeColor);
//   const fillColor = useSelector(selectFillColor);
//   const strokeWidth = useSelector(selectStrokeWidth);
//   const opacity = useSelector(selectOpacity);

//   return (
//     <motion.aside
//       initial={{ x: 80, opacity: 0 }}
//       animate={{ x: 0, opacity: 1 }}
//       transition={{ duration: 0.3, ease: 'easeOut' }}
//       className="w-60 bg-neutral-900 border-l border-neutral-800 p-4
//                  flex flex-col gap-5 overflow-y-auto h-full"
//     >
//       <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
//         Properties
//       </h2>

//       {/* Stroke Color */}
//       <div className="flex flex-col gap-2">
//         <label className="text-neutral-400 text-xs uppercase tracking-wide">
//           Stroke Color
//         </label>
//         <HexColorPicker
//           color={strokeColor}
//           onChange={(color) => dispatch(setStrokeColor(color))}
//           style={{ width: '100%', height: 140 }}
//         />
//         <input
//           type="text"
//           value={strokeColor}
//           onChange={(e) => dispatch(setStrokeColor(e.target.value))}
//           className="bg-neutral-800 text-white text-sm rounded px-2 py-1
//                      border border-neutral-700 focus:outline-none focus:border-violet-500"
//         />
//       </div>

//       {/* Fill Color */}
//       <div className="flex flex-col gap-2">
//         <label className="text-neutral-400 text-xs uppercase tracking-wide">
//           Fill Color
//         </label>
//         <HexColorPicker
//           color={fillColor === 'transparent' ? '#ffffff' : fillColor}
//           onChange={(color) => dispatch(setFillColor(color))}
//           style={{ width: '100%', height: 140 }}
//         />
//       </div>

//       {/* Stroke Width */}
//       <div className="flex flex-col gap-2">
//         <label className="text-neutral-400 text-xs uppercase tracking-wide">
//           Stroke Width — {strokeWidth}px
//         </label>
//         <input
//           type="range"
//           min={1}
//           max={50}
//           value={strokeWidth}
//           onChange={(e) => dispatch(setStrokeWidth(Number(e.target.value)))}
//           className="accent-violet-500 w-full"
//         />
//       </div>

//       {/* Opacity */}
//       <div className="flex flex-col gap-2">
//         <label className="text-neutral-400 text-xs uppercase tracking-wide">
//           Opacity — {Math.round(opacity * 100)}%
//         </label>
//         <input
//           type="range"
//           min={0}
//           max={1}
//           step={0.01}
//           value={opacity}
//           onChange={(e) => dispatch(setOpacity(Number(e.target.value)))}
//           className="accent-violet-500 w-full"
//         />
//       </div>
//     </motion.aside>
//   );
// };

// export default PropertiesPanel;
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import {
  selectStrokeColor,
  selectFillColor,
  selectStrokeWidth,
  selectOpacity,
  selectBrushDensity,
  setStrokeColor,
  setFillColor,
  setStrokeWidth,
  setOpacity,
  setBrushDensity,
} from '../../store/slices/toolSlice';
import { selectActiveTool } from '../../store/slices/canvasSlice';

const SectionTitle = ({ children }) => (
  <h3 className="text-neutral-500 text-[10px] font-semibold uppercase tracking-widest mb-2">
    {children}
  </h3>
);

const SliderRow = ({ label, value, min, max, step = 1, onChange, unit = '' }) => (
  <div className="flex flex-col gap-1.5">
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
      className="w-full h-1.5 rounded-full accent-violet-500 cursor-pointer"
    />
  </div>
);

const PropertiesPanel = () => {
  const dispatch     = useDispatch();
  const activeTool   = useSelector(selectActiveTool);
  const strokeColor  = useSelector(selectStrokeColor);
  const fillColor    = useSelector(selectFillColor);
  const strokeWidth  = useSelector(selectStrokeWidth);
  const opacity      = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);

  const isBrushTool  = ['pencil', 'spray', 'circle-brush', 'eraser'].includes(activeTool);
  const isSpray      = activeTool === 'spray';
  const isShapeTool  = ['rect', 'circle', 'triangle', 'line'].includes(activeTool);

  return (
    <motion.aside
      initial={{ x: 240, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-60 bg-neutral-900 border-l border-neutral-800
                 flex flex-col gap-5 p-4
                 h-full overflow-y-auto z-30 shrink-0"
    >
      {/* ── Stroke Color ──────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Stroke Color</SectionTitle>
        <HexColorPicker
          color={strokeColor}
          onChange={(c) => dispatch(setStrokeColor(c))}
          style={{ width: '100%', height: 130 }}
        />
        <input
          type="text"
          value={strokeColor}
          onChange={(e) => dispatch(setStrokeColor(e.target.value))}
          className="mt-2 w-full bg-neutral-800 text-neutral-200 text-xs
                     font-mono rounded-lg px-3 py-2 border border-neutral-700
                     focus:outline-none focus:border-violet-500 transition-colors"
          placeholder="#000000"
          maxLength={9}
        />
      </div>

      {/* ── Fill Color (shapes only) ──────────────────────────────────── */}
      {isShapeTool && (
        <div>
          <SectionTitle>Fill Color</SectionTitle>
          <HexColorPicker
            color={fillColor === 'transparent' ? '#ffffff' : fillColor}
            onChange={(c) => dispatch(setFillColor(c))}
            style={{ width: '100%', height: 130 }}
          />
          <button
            onClick={() => dispatch(setFillColor('transparent'))}
            className="mt-2 w-full text-xs text-neutral-500 hover:text-neutral-300
                       border border-dashed border-neutral-700 rounded-lg py-1.5
                       transition-colors"
          >
            No Fill (transparent)
          </button>
        </div>
      )}

      {/* ── Stroke / Brush Width ──────────────────────────────────────── */}
      <div>
        <SectionTitle>
          {isBrushTool ? 'Brush Size' : 'Stroke Width'}
        </SectionTitle>
        <SliderRow
          label="Width"
          value={strokeWidth}
          min={1}
          max={80}
          unit="px"
          onChange={(v) => dispatch(setStrokeWidth(v))}
        />
      </div>

      {/* ── Spray Density ─────────────────────────────────────────────── */}
      {isSpray && (
        <div>
          <SectionTitle>Spray Density</SectionTitle>
          <SliderRow
            label="Density"
            value={brushDensity}
            min={5}
            max={80}
            onChange={(v) => dispatch(setBrushDensity(v))}
          />
        </div>
      )}

      {/* ── Opacity ───────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Opacity</SectionTitle>
        <SliderRow
          label="Opacity"
          value={opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => dispatch(setOpacity(v))}
        />
      </div>

      {/* ── Active Tool Hint ──────────────────────────────────────────── */}
      <div className="mt-auto pt-4 border-t border-neutral-800">
        <p className="text-neutral-600 text-[10px] uppercase tracking-wider font-medium">
          Active Tool
        </p>
        <p className="text-violet-400 text-sm font-semibold capitalize mt-0.5">
          {activeTool.replace('-', ' ')}
        </p>
        <p className="text-neutral-600 text-[10px] mt-2 leading-relaxed">
          {activeTool === 'select'  && 'Click to select objects. Drag to move. Hold Alt + drag to pan.'}
          {activeTool === 'pencil'  && 'Freehand drawing. Adjust brush size and color above.'}
          {activeTool === 'spray'   && 'Spray particles. Increase density for heavier coverage.'}
          {activeTool === 'eraser'  && 'Draws in the canvas background color to erase.'}
          {isShapeTool              && 'Shape added to canvas. Drag to move, handles to resize.'}
          {activeTool === 'text'    && 'Double-click the text object on canvas to edit.'}
        </p>
      </div>
    </motion.aside>
  );
};

export default PropertiesPanel;
