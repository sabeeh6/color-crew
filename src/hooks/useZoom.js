// src/hooks/useZoom.js
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { setZoomLevel } from '../store/slices/canvasSlice';

export const useZoom = () => {
  const dispatch = useDispatch();

  // Mouse wheel zoom — syncs level to Redux
  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    const handleWheel = (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.1), 10);

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      dispatch(setZoomLevel(Math.round(zoom * 100) / 100));

      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on('mouse:wheel', handleWheel);
    return () => canvas.off('mouse:wheel', handleWheel);
  }, [dispatch]);

  // Alt + Drag to pan
  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (opt) => {
      if (opt.e.altKey) {
        isPanning = true;
        canvas.selection = false;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        canvas.defaultCursor = 'grabbing';
      }
    };

    const onMouseMove = (opt) => {
      if (!isPanning) return;
      const vpt = canvas.viewportTransform;
      vpt[4] += opt.e.clientX - lastX;
      vpt[5] += opt.e.clientY - lastY;
      canvas.requestRenderAll();
      lastX = opt.e.clientX;
      lastY = opt.e.clientY;
    };

    const onMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.setViewportTransform(canvas.viewportTransform);
      }
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, []);

  const zoomIn = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const zoom = Math.min(canvas.getZoom() * 1.2, 10);
    canvas.setZoom(zoom);
    dispatch(setZoomLevel(Math.round(zoom * 100) / 100));
  }, [dispatch]);

  const zoomOut = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const zoom = Math.max(canvas.getZoom() / 1.2, 0.1);
    canvas.setZoom(zoom);
    dispatch(setZoomLevel(Math.round(zoom * 100) / 100));
  }, [dispatch]);

  const zoomReset = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    dispatch(setZoomLevel(1));
  }, [dispatch]);

  return { zoomIn, zoomOut, zoomReset };
};