// src/hooks/useCanvas.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Canvas } from 'fabric';
import {
  setCanvasInstance,
  destroyCanvasInstance,
} from '../utils/canvasSingleton';
import { setZoomLevel } from '../store/slices/canvasSlice';

export const useCanvas = () => {
  const canvasElRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!canvasElRef.current) return;

    // Initialize Fabric.js v6 Canvas
    const fabricCanvas = new Canvas(canvasElRef.current, {
      isDrawingMode: false,
      backgroundColor: '#ffffff',
      width: window.innerWidth - 300,   // subtract left + right panel widths
      height: window.innerHeight - 60,  // subtract toolbar height
      selection: true,
      allowTouchScrolling: false,       // prevent scroll during touch drawing
    });

    // Store in singleton — accessible from all hooks
    setCanvasInstance(fabricCanvas);

    // Keep Redux zoom in sync
    dispatch(setZoomLevel(1));

    // Handle window resize
    const handleResize = () => {
      fabricCanvas.setWidth(window.innerWidth - 300);
      fabricCanvas.setHeight(window.innerHeight - 60);
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount — required to avoid memory leaks (React StrictMode safe)
    return () => {
      window.removeEventListener('resize', handleResize);
      destroyCanvasInstance(); // v6: dispose() is async-safe
    };
  }, [dispatch]);

  return { canvasElRef };
};