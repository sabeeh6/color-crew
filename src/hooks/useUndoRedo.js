// src/hooks/useUndoRedo.js
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { setCanUndo, setCanRedo } from '../store/slices/canvasSlice';

const HISTORY_LIMIT = 50;

// Extract state out of the react hook instance so it behaves as a global/singleton store.
// This resolves the bug where CanvasToolbar and useCanvasEvents had different useRef instances!
let globalHistoryStack = [];
let globalRedoStack = [];
let isMutatingGlobal = false;

export const useUndoRedo = () => {
  const dispatch = useDispatch();

  const saveState = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas || isMutatingGlobal) return;

    const snapshot = JSON.stringify(
      canvas.toJSON(['id', 'name', 'customType'])
    );

    // Skip if snapshot is identical to the last one (prevents double-save bugs)
    if (globalHistoryStack.length > 0 && globalHistoryStack[globalHistoryStack.length - 1] === snapshot) {
      return;
    }

    globalHistoryStack.push(snapshot);

    // Cap history to limit memory usage
    if (globalHistoryStack.length > HISTORY_LIMIT) {
      globalHistoryStack.shift();
    }

    globalRedoStack = [];
    dispatch(setCanUndo(globalHistoryStack.length > 1));
    dispatch(setCanRedo(false));
  }, [dispatch]);

  const undo = useCallback(async () => {
    const canvas = getCanvasInstance();
    if (!canvas || globalHistoryStack.length <= 1) return;

    isMutatingGlobal = true;
    const currentState = globalHistoryStack.pop();
    globalRedoStack.push(currentState);

    const previousState = globalHistoryStack[globalHistoryStack.length - 1];
    if (previousState) {
      // v6: loadFromJSON returns a Promise
      await canvas.loadFromJSON(JSON.parse(previousState));
      canvas.renderAll();
    }

    dispatch(setCanUndo(globalHistoryStack.length > 1));
    dispatch(setCanRedo(globalRedoStack.length > 0));
    isMutatingGlobal = false;
  }, [dispatch]);

  const redo = useCallback(async () => {
    const canvas = getCanvasInstance();
    if (!canvas || globalRedoStack.length === 0) return;

    isMutatingGlobal = true;
    const nextState = globalRedoStack.pop();
    globalHistoryStack.push(nextState);

    await canvas.loadFromJSON(JSON.parse(nextState));
    canvas.renderAll();

    dispatch(setCanUndo(globalHistoryStack.length > 1));
    dispatch(setCanRedo(globalRedoStack.length > 0));
    isMutatingGlobal = false;
  }, [dispatch]);

  // Listen to keyboard shortcuts dispatched from DrawingPage (CustomEvents)
  useEffect(() => {
    const handleUndo = () => {
       if (globalHistoryStack.length > 1) undo();
    };
    const handleRedo = () => {
       if (globalRedoStack.length > 0) redo();
    };

    document.addEventListener('canvas:undo', handleUndo);
    document.addEventListener('canvas:redo', handleRedo);

    return () => {
      document.removeEventListener('canvas:undo', handleUndo);
      document.removeEventListener('canvas:redo', handleRedo);
    };
  }, [undo, redo]);

  // Return getters for current objects so earlier callers like `useCanvasEvents` don't break
  return { 
     saveState, 
     undo, 
     redo, 
     // simulate ref.current accessor behavior just in case
     historyStack: { get current() { return globalHistoryStack; } }, 
     redoStack: { get current() { return globalRedoStack; } } 
  };
};