// // src/components/tools/ToolsPanel.jsx
// import { useDispatch, useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Pencil, Eraser, Square, Circle, Triangle,
//   Minus, Type, MousePointer, Paintbrush, Sprout
// } from 'lucide-react';
// import { selectActiveTool } from '../../store/slices/canvasSlice';
// import { useDrawingTools } from '../../hooks/useDrawingTools';

// const tools = [
//   { id: 'select',       label: 'Select',   Icon: MousePointer },
//   { id: 'pencil',       label: 'Pencil',   Icon: Pencil },
//   { id: 'spray',        label: 'Spray',    Icon: Paintbrush },
//   { id: 'circle-brush', label: 'Round',    Icon: Sprout },
//   { id: 'eraser',       label: 'Eraser',   Icon: Eraser },
//   { id: 'rect',         label: 'Rect',     Icon: Square },
//   { id: 'circle',       label: 'Circle',   Icon: Circle },
//   { id: 'triangle',     label: 'Triangle', Icon: Triangle },
//   { id: 'line',         label: 'Line',     Icon: Minus },
//   { id: 'text',         label: 'Text',     Icon: Type },
// ];

// const toolActions = {
//   select: 'activateSelect',
//   pencil: 'activatePencil',
//   spray: 'activateSpray',
//   'circle-brush': 'activateCircleBrush',
//   eraser: 'activateEraser',
//   rect: 'addRectangle',
//   circle: 'addCircle',
//   triangle: 'addTriangle',
//   line: 'addLine',
//   text: 'addText',
// };

// const ToolsPanel = () => {
//   // Read active tool from Redux
//   const activeTool = useSelector(selectActiveTool);
//   const drawingTools = useDrawingTools();

//   const handleToolClick = (toolId) => {
//     const action = toolActions[toolId];
//     if (action && drawingTools[action]) {
//       drawingTools[action]();
//     }
//   };

//   return (
//     <motion.aside
//       initial={{ x: -80, opacity: 0 }}
//       animate={{ x: 0, opacity: 1 }}
//       transition={{ duration: 0.3, ease: 'easeOut' }}
//       className="w-16 bg-neutral-900 border-r border-neutral-800 flex flex-col
//                  items-center py-4 gap-2 h-full shadow-xl"
//     >
//       {tools.map(({ id, label, Icon }) => (
//         <motion.button
//           key={id}
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => handleToolClick(id)}
//           title={label}
//           className={`
//             w-10 h-10 rounded-lg flex items-center justify-center
//             transition-colors duration-150 group relative
//             ${activeTool === id
//               ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
//               : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
//             }
//           `}
//         >
//           <Icon size={18} />
//           {/* Tooltip */}
//           <span className="absolute left-14 bg-neutral-800 text-white text-xs
//                            rounded px-2 py-1 whitespace-nowrap opacity-0
//                            group-hover:opacity-100 transition-opacity pointer-events-none z-50">
//             {label}
//           </span>
//         </motion.button>
//       ))}
//     </motion.aside>
//   );
// };

// export default ToolsPanel;
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MousePointer2, Pencil, Paintbrush, Eraser,
  Square, Circle, Triangle, Minus, Type, Disc,
} from 'lucide-react';
import { selectActiveTool } from '../../store/slices/canvasSlice';
import { useDrawingTools }  from '../../hooks/useDrawingTools';

const tools = [
  { id: 'select',       label: 'Select  (V)',        Icon: MousePointer2, group: 'nav'    },
  { id: 'pencil',       label: 'Pencil  (P)',         Icon: Pencil,        group: 'draw'  },
  { id: 'spray',        label: 'Spray Brush',         Icon: Paintbrush,    group: 'draw'  },
  { id: 'circle-brush', label: 'Round Brush',         Icon: Disc,          group: 'draw'  },
  { id: 'eraser',       label: 'Eraser  (E)',         Icon: Eraser,        group: 'draw'  },
  { id: 'rect',         label: 'Rectangle  (R)',      Icon: Square,        group: 'shape' },
  { id: 'circle',       label: 'Circle  (C)',         Icon: Circle,        group: 'shape' },
  { id: 'triangle',     label: 'Triangle  (T)',       Icon: Triangle,      group: 'shape' },
  { id: 'line',         label: 'Line  (L)',            Icon: Minus,         group: 'shape' },
  { id: 'text',         label: 'Text  (X)',            Icon: Type,          group: 'text'  },
];

const toolActionMap = {
  select:         'activateSelect',
  pencil:         'activatePencil',
  spray:          'activateSpray',
  'circle-brush': 'activateCircleBrush',
  eraser:         'activateEraser',
  rect:           'addRectangle',
  circle:         'addCircle',
  triangle:       'addTriangle',
  line:           'addLine',
  text:           'addText',
};

const Divider = () => (
  <div className="w-6 h-px bg-neutral-800 mx-auto my-1" />
);

const ToolsPanel = () => {
  const activeTool   = useSelector(selectActiveTool);
  const drawingTools = useDrawingTools();

  const handleToolClick = (toolId) => {
    const fn = drawingTools[toolActionMap[toolId]];
    if (fn) fn();
  };

  // Group tools for dividers
  const groups = ['nav', 'draw', 'shape', 'text'];
  const byGroup = groups.map((g) => tools.filter((t) => t.group === g));

  return (
    <motion.aside
      initial={{ x: -64, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-16 bg-neutral-900 border-r border-neutral-800
                 flex flex-col items-center py-3 gap-0.5
                 h-full overflow-y-auto z-30 shrink-0"
    >
      {byGroup.map((group, gi) => (
        <div key={gi} className="w-full flex flex-col items-center gap-0.5">
          {gi > 0 && <Divider />}

          {group.map(({ id, label, Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleToolClick(id)}
              title={label}
              className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-150 group
                ${activeTool === id
                  ? 'bg-violet-600 text-white shadow-md tool-active-glow'
                  : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100'
                }
              `}
            >
              <Icon size={17} strokeWidth={activeTool === id ? 2.5 : 1.8} />

              {/* Floating label tooltip */}
              <span className="
                absolute left-14 z-50 pointer-events-none select-none
                bg-neutral-800 text-white text-xs font-medium
                rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl
                border border-neutral-700
                opacity-0 group-hover:opacity-100
                transition-opacity duration-150
              ">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      ))}
    </motion.aside>
  );
};

export default ToolsPanel;
