// src/hooks/useToolPropertiesSync.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { selectActiveTool } from '../store/slices/canvasSlice';
import {
  selectStrokeColor,
  selectFillColor,
  selectStrokeWidth,
  selectOpacity,
  selectBrushDensity,
  selectFontSize,
  selectFontFamily,
} from '../store/slices/toolSlice';

export const useToolPropertiesSync = () => {
  const activeTool = useSelector(selectActiveTool);
  const strokeColor = useSelector(selectStrokeColor);
  const fillColor = useSelector(selectFillColor);
  const strokeWidth = useSelector(selectStrokeWidth);
  const opacity = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);
  const fontSize = useSelector(selectFontSize);
  const fontFamily = useSelector(selectFontFamily);

  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    // 1. Update Free Drawing Brush
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      if (['pencil', 'spray', 'circle-brush'].includes(activeTool)) {
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = strokeWidth;

        if (activeTool === 'spray') {
          canvas.freeDrawingBrush.density = brushDensity;
        }
      } else if (activeTool === 'eraser') {
        canvas.freeDrawingBrush.width = strokeWidth * 4;
        // Eraser color stays background color
      }
    }

    // 2. Update Selected Object(s)
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      let isChanged = false;

      activeObjects.forEach((obj) => {
        // Text objects
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'FabricText') {
          obj.set({
            fill: strokeColor,
            fontSize,
            fontFamily,
            opacity,
          });
          isChanged = true;
        }
        // Drawn paths (pencil, brush)
        else if (obj.type === 'path') {
          // Note: if the user selected an erased path, it might change color. 
          // Usually erasers have a specific property or it's hard to distinguish.
          // We'll just update stroke to strokeColor.
          obj.set({
            stroke: strokeColor,
            strokeWidth,
            opacity,
          });
          isChanged = true;
        }
        // Shapes
        else if (['rect', 'circle', 'triangle', 'line', 'polygon', 'ellipse'].includes(obj.type)) {
          obj.set({
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth,
            opacity,
          });
          isChanged = true;
        }
      });

      if (isChanged) {
        canvas.renderAll();
      }
    }
  }, [
    activeTool,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    brushDensity,
    fontSize,
    fontFamily,
  ]);
};
