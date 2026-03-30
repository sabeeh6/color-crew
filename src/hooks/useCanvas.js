// src/hooks/useCanvas.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Canvas } from 'fabric';
import {
  setCanvasInstance,
  destroyCanvasInstance,
} from '../utils/canvasSingleton';
import { useUndoRedo } from './useUndoRedo';
import { setZoomLevel } from '../store/slices/canvasSlice';

export const useCanvas = () => {
  const canvasElRef = useRef(null);
  const dispatch = useDispatch();
  const { saveState } = useUndoRedo();

  useEffect(() => {
    if (!canvasElRef.current) return;

    const parent = canvasElRef.current.parentElement;

    // Initialize Fabric.js v6 Canvas using parent dimensions
    const fabricCanvas = new Canvas(canvasElRef.current, {
      isDrawingMode: false,
      backgroundColor: '#ffffff',
      width: parent.clientWidth || 800,
      height: parent.clientHeight || 600,
      selection: true,
      allowTouchScrolling: false, // prevent scroll during touch drawing
    });

    // Store in singleton — accessible from all hooks
    setCanvasInstance(fabricCanvas);

    // Save initial empty state for undo
    saveState();

    // Keep Redux zoom in sync
    dispatch(setZoomLevel(1));

    // Responsive resizing using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        fabricCanvas.setDimensions({ width, height });
        fabricCanvas.renderAll();
      }
    });

    if (parent) {
      resizeObserver.observe(parent);
    }

    // Cleanup on unmount — required to avoid memory leaks
    return () => {
      resizeObserver.disconnect();
      destroyCanvasInstance(); // v6: dispose() is async-safe
    };
  }, [dispatch]);


  return { canvasElRef };
};