
// src/hooks/useUndoRedo.js
import { useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { setCanUndo, setCanRedo } from '../store/slices/canvasSlice';

const HISTORY_LIMIT = 50;

export const useUndoRedo = () => {
  const dispatch = useDispatch();
  const historyStack = useRef([]);   // array of JSON strings
  const redoStack = useRef([]);
  const isMutating = useRef(false);  // prevent recursive saves

  const saveState = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas || isMutating.current) return;

    const snapshot = JSON.stringify(
      canvas.toJSON(['id', 'name', 'customType'])
    );

    historyStack.current.push(snapshot);

    // Cap history to limit memory usage
    if (historyStack.current.length > HISTORY_LIMIT) {
      historyStack.current.shift();
    }

    redoStack.current = [];
    dispatch(setCanUndo(historyStack.current.length > 1));
    dispatch(setCanRedo(false));
  }, [dispatch]);

  const undo = useCallback(async () => {
    const canvas = getCanvasInstance();
    if (!canvas || historyStack.current.length <= 1) return;

    isMutating.current = true;
    const currentState = historyStack.current.pop();
    redoStack.current.push(currentState);

    const previousState = historyStack.current[historyStack.current.length - 1];
    if (previousState) {
      // v6: loadFromJSON returns a Promise
      await canvas.loadFromJSON(JSON.parse(previousState));
      canvas.renderAll();
    }

    dispatch(setCanUndo(historyStack.current.length > 1));
    dispatch(setCanRedo(redoStack.current.length > 0));
    isMutating.current = false;
  }, [dispatch]);

  const redo = useCallback(async () => {
    const canvas = getCanvasInstance();
    if (!canvas || redoStack.current.length === 0) return;

    isMutating.current = true;
    const nextState = redoStack.current.pop();
    historyStack.current.push(nextState);

    await canvas.loadFromJSON(JSON.parse(nextState));
    canvas.renderAll();

    dispatch(setCanUndo(historyStack.current.length > 1));
    dispatch(setCanRedo(redoStack.current.length > 0));
    isMutating.current = false;
  }, [dispatch]);

  return { saveState, undo, redo, historyStack, redoStack };
};