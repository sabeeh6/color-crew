// src/hooks/useCanvasEvents.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { setCanUndo, setCanRedo, selectCurrentSketchId } from '../store/slices/canvasSlice';
import { useUndoRedo } from './useUndoRedo';
import { useSelector } from 'react-redux';
import { socket } from '../utils/socket';

export const useCanvasEvents = () => {
  const dispatch = useDispatch();
  const sketchId = useSelector(selectCurrentSketchId);
  const { saveState, historyStack, redoStack } = useUndoRedo();

  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    const emitUpdate = () => {
      if (window.__isRemoteUpdate || !sketchId) return;
      const json = canvas.toJSON();
      socket.emit("canvas-update", { roomId: sketchId, fabricJSON: json });
    };

    const onObjectAdded = (opt) => {
      if (window.__isRemoteUpdate) return;
      // Only save if it's NOT a path (regular paths are handled by onPathCreated)
      if (opt.target && opt.target.type !== 'path') {
        saveState();
        emitUpdate();
      }
      dispatch(setCanUndo(historyStack.current.length > 1));
      dispatch(setCanRedo(false));
    };

    const onObjectModified = () => {
      if (window.__isRemoteUpdate) return;
      saveState();
      emitUpdate();
      dispatch(setCanUndo(historyStack.current.length > 1));
      dispatch(setCanRedo(false));
    };

    const onObjectRemoved = () => {
      if (window.__isRemoteUpdate) return;
      saveState();
      emitUpdate();
      dispatch(setCanUndo(historyStack.current.length > 1));
    };

    const onPathCreated = () => {
      if (window.__isRemoteUpdate) return;
      saveState();
      emitUpdate();
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
  }, [dispatch, saveState, sketchId]);
};