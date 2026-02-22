// src/hooks/useCanvasEvents.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { setCanUndo, setCanRedo } from '../store/slices/canvasSlice';
import { useUndoRedo } from './useUndoRedo';

export const useCanvasEvents = () => {
  const dispatch = useDispatch();
  const { saveState, historyStack, redoStack } = useUndoRedo();

  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    const onObjectAdded = () => {
      saveState();
      dispatch(setCanUndo(historyStack.current.length > 1));
      dispatch(setCanRedo(false));
    };

    const onObjectModified = () => {
      saveState();
      dispatch(setCanUndo(historyStack.current.length > 1));
      dispatch(setCanRedo(false));
    };

    const onObjectRemoved = () => {
      saveState();
      dispatch(setCanUndo(historyStack.current.length > 1));
    };

    const onPathCreated = () => {
      saveState();
      dispatch(setCanUndo(true));
      dispatch(setCanRedo(false));
    };

    canvas.on('object:added', onObjectAdded);
    canvas.on('object:modified', onObjectModified);
    canvas.on('object:removed', onObjectRemoved);
    canvas.on('path:created', onPathCreated);

    return () => {
      canvas.off('object:added', onObjectAdded);
      canvas.off('object:modified', onObjectModified);
      canvas.off('object:removed', onObjectRemoved);
      canvas.off('path:created', onPathCreated);
    };
  }, [dispatch, saveState]);
};