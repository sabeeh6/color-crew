// src/components/tools/ToolsPanel.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2, Pencil, Paintbrush, Eraser,
  Square, Circle, Triangle, Minus, Type, Disc,
  Star, Heart, MoveRight, Hexagon, Orbit,
  CircleDashed, Activity, Shapes as ShapesIcon,
  ChevronLeft, Cloud, Feather, Highlighter, 
  Brush, Spline, Waves, Palette, Droplets,
  PenTool, Droplet, Wind, CircleDot, Grip
} from 'lucide-react';
import { selectActiveTool } from '../../store/slices/canvasSlice';
import { useDrawingTools }  from '../../hooks/useDrawingTools';

const mainTools = [
  { id: 'select',       label: 'Select (V)',       Icon: MousePointer2 },
  { id: 'eraser',       label: 'Eraser (E)',       Icon: Eraser },
  { id: 'text',         label: 'Text (X)',         Icon: Type },
];

const brushTools = [
  { id: 'pencil',       label: 'Pencil',           Icon: Pencil },
  { id: 'ink',          label: 'Ink Pen',          Icon: Feather },
  { id: 'dip-pen',      label: 'Dip Pen',          Icon: PenTool },
  { id: 'marker',       label: 'Marker',           Icon: Highlighter },
  { id: 'chalk',        label: 'Chalk',            Icon: Brush },
  { id: 'watercolor',   label: 'Watercolor',       Icon: Droplet },
  { id: 'hard-round',   label: 'Hard Round',       Icon: CircleDot },
  { id: 'hair',         label: 'Hair (Rake)',      Icon: Grip },
  { id: 'ribbon',       label: 'Ribbon',           Icon: Spline },
  { id: 'blend',        label: 'Smudge / Blend',   Icon: Droplets },
  { id: 'spray-dense',  label: 'Spray (Dense)',    Icon: Waves },
  { id: 'airbrush',     label: 'Airbrush',         Icon: Wind },
  { id: 'circle-brush', label: 'Round Brush',      Icon: Disc },
];

const shapeTools = [
  { id: 'rect',         label: 'Rectangle',    Icon: Square },
  { id: 'circle',       label: 'Circle',       Icon: Circle },
  { id: 'ellipse',      label: 'Ellipse',      Icon: Orbit },
  { id: 'triangle',     label: 'Triangle',     Icon: Triangle },
  { id: 'hexagon',      label: 'Hexagon',      Icon: Hexagon },
  { id: 'star',         label: 'Star',         Icon: Star },
  { id: 'heart',        label: 'Heart',        Icon: Heart },
  { id: 'cloud',        label: 'Cloud',        Icon: Cloud },
  { id: 'arrow',        label: 'Arrow',        Icon: MoveRight },
  { id: 'line',         label: 'Line',         Icon: Minus },
  { id: 'ring',         label: 'Ring',         Icon: CircleDashed },
  { id: 'arc',          label: 'Arc',          Icon: Activity },
];

const toolActionMap = {
  select:         'activateSelect',
  pencil:         'activatePencil',
  ink:            'activateInk',
  'dip-pen':      'activateDipPen',
  marker:         'activateMarker',
  chalk:          'activateChalk',
  watercolor:     'activateWatercolor',
  'hard-round':   'activateHardRound',
  hair:           'activateHair',
  ribbon:         'activateRibbon',
  blend:          'activateBlend',
  'spray-dense':  'activateSprayDense',
  airbrush:       'activateAirBrush',
  'circle-brush': 'activateCircleBrush',
  eraser:         'activateEraser',
  text:           'addText',
  rect:           'addRectangle',
  circle:         'addCircle',
  triangle:       'addTriangle',
  line:           'addLine',
  star:           'addStar',
  heart:          'addHeart',
  arrow:          'addArrow',
  hexagon:        'addHexagon',
  ellipse:        'addEllipse',
  ring:           'addRing',
  arc:            'addArc',
  cloud:          'addCloud',
};

const ToolsPanel = () => {
  const activeTool = useSelector(selectActiveTool);
  const drawingTools = useDrawingTools();
  const [view, setView] = useState('main'); // 'main' or 'shapes'

  const handleToolClick = (toolId) => {
    const fn = drawingTools[toolActionMap[toolId]];
    if (fn) fn();
  };

  const btnClass = (id) => `
    relative w-10 h-10 rounded-xl flex items-center justify-center
    transition-all duration-200 group
    ${activeTool === id
      ? 'bg-violet-600 text-white shadow-lg tool-active-glow'
      : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100'
    }
  `;

  return (
    <motion.aside
      initial={{ x: -64, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      className="w-16 bg-neutral-900 border-r border-neutral-800
                 flex flex-col items-center py-3 gap-2
                 h-full overflow-hidden z-30 shrink-0"
    >
      <AnimatePresence mode="wait">
        {view === 'main' ? (
          <motion.div
            key="main"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-2 w-full"
          >
            {mainTools.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleToolClick(id)}
                title={label}
                className={btnClass(id)}
              >
                <Icon size={18} strokeWidth={activeTool === id ? 2.5 : 1.8} />
                <span className="tooltip">{label}</span>
              </button>
            ))}

            <div className="w-6 h-px bg-neutral-800 my-1" />

            <button
              onClick={() => setView('brushes')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center
                         transition-all duration-200 group relative
                         ${view === 'brushes' || brushTools.some(t => t.id === activeTool)
                           ? 'bg-violet-600/20 text-violet-400'
                           : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100'
                         }`}
            >
              <Palette size={20} />
              <span className="tooltip">Brushes</span>
            </button>

            <button
              onClick={() => setView('shapes')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center
                         transition-all duration-200 group relative
                         ${view === 'shapes' || shapeTools.some(t => t.id === activeTool)
                           ? 'bg-violet-600/20 text-violet-400'
                           : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100'
                         }`}
            >
              <ShapesIcon size={20} />
              <span className="tooltip">Shapes Library</span>
            </button>
          </motion.div>
        ) : view === 'brushes' ? (
          <motion.div
            key="brushes"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-2 w-full h-full"
          >
            <button
              onClick={() => setView('main')}
              className="w-10 h-8 rounded-lg flex items-center justify-center
                         text-neutral-500 hover:bg-neutral-800 hover:text-white
                         transition-colors mb-1"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center gap-2 pb-4 overflow-y-auto custom-scrollbar w-full">
              {brushTools.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleToolClick(id)}
                  title={label}
                  className={btnClass(id)}
                >
                  <Icon size={18} strokeWidth={activeTool === id ? 2.5 : 1.8} />
                  <span className="tooltip">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="shapes"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-2 w-full h-full"
          >
            <button
              onClick={() => setView('main')}
              className="w-10 h-8 rounded-lg flex items-center justify-center
                         text-neutral-500 hover:bg-neutral-800 hover:text-white
                         transition-colors mb-1"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center gap-2 pb-4 overflow-y-auto custom-scrollbar w-full">
              {shapeTools.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => handleToolClick(id)}
                  title={label}
                  className={btnClass(id)}
                >
                  <Icon size={18} strokeWidth={activeTool === id ? 2.5 : 1.8} />
                  <span className="tooltip">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .tooltip {
          position: absolute;
          left: 3.5rem;
          z-index: 50;
          pointer-events: none;
          user-select: none;
          background: #262626;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.5rem;
          padding: 0.4rem 0.6rem;
          white-space: nowrap;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid #404040;
          opacity: 0;
          transition: opacity 0.15s;
        }
        button:hover .tooltip {
          opacity: 1;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 10px;
        }
      `}</style>
    </motion.aside>
  );
};

export default ToolsPanel;
