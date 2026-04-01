// src/hooks/useToolPropertiesSync.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Shadow } from 'fabric';
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
  selectShadowEnabled,
  selectShadowColor,
  selectShadowBlur,
  selectShadowOffsetX,
  selectShadowOffsetY,
} from '../store/slices/toolSlice';
import { hexToRgba } from '../utils/colorUtils';


export const useToolPropertiesSync = () => {
  const activeTool = useSelector(selectActiveTool);
  const strokeColor = useSelector(selectStrokeColor);
  const fillColor = useSelector(selectFillColor);
  const strokeWidth = useSelector(selectStrokeWidth);
  const opacity = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);
  const fontSize = useSelector(selectFontSize);
  const fontFamily = useSelector(selectFontFamily);

  // Advanced Props
  const shadowEnabled = useSelector(selectShadowEnabled);
  const shadowColor = useSelector(selectShadowColor);
  const shadowBlur = useSelector(selectShadowBlur);
  const shadowOffsetX = useSelector(selectShadowOffsetX);
  const shadowOffsetY = useSelector(selectShadowOffsetY);

  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    // 2. Build Shadow Object
    const shadowObj = shadowEnabled ? new Shadow({
      color: shadowColor,
      blur: shadowBlur || 0.1, // Fabric likes a small value if color is present
      offsetX: shadowOffsetX,
      offsetY: shadowOffsetY,
      affectStroke: true,
    }) : null;

    // 1. Update Free Drawing Brush
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      if (['pencil', 'spray', 'circle-brush'].includes(activeTool)) {
        canvas.freeDrawingBrush.color = hexToRgba(strokeColor, opacity);
        canvas.freeDrawingBrush.width = strokeWidth;
        canvas.freeDrawingBrush.shadow = shadowObj;

        if (activeTool === 'spray') {
          canvas.freeDrawingBrush.density = brushDensity;
        }
      } else if (activeTool === 'eraser') {
        canvas.freeDrawingBrush.width = strokeWidth * 4;
        canvas.freeDrawingBrush.shadow = null;
        // Eraser color stays background color
      }
    }


    // 3. Update Selected Object(s)
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      let isChanged = false;

      activeObjects.forEach((obj) => {
        const baseProps = {
          opacity,
          shadow: shadowObj,
          dirty: true, // Force re-render if cached
        };

        // ... existing text/path/shape logic
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'FabricText') {
          obj.set({ ...baseProps, fill: strokeColor, fontSize, fontFamily });
          isChanged = true;
        } else if (obj.type === 'path') {
          obj.set({ ...baseProps, stroke: strokeColor, strokeWidth });
          isChanged = true;
        } else if (['rect', 'circle', 'triangle', 'line', 'polygon', 'ellipse'].includes(obj.type)) {
          obj.set({ ...baseProps, fill: fillColor, stroke: strokeColor, strokeWidth });
          isChanged = true;
        }
      });

      if (isChanged) {
        canvas.requestRenderAll();
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
    shadowEnabled,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
  ]);
};



