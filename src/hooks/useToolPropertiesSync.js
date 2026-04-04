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

// All brush tool IDs that use freeDrawingBrush
const FREE_BRUSH_TOOLS = [
  'pencil', 'ink', 'marker', 'chalk', 'ribbon', 'blend',
  'spray-dense', 'circle-brush',
];

export const useToolPropertiesSync = () => {
  const activeTool  = useSelector(selectActiveTool);
  const strokeColor = useSelector(selectStrokeColor);
  const fillColor   = useSelector(selectFillColor);
  const strokeWidth = useSelector(selectStrokeWidth);
  const opacity     = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);
  const fontSize    = useSelector(selectFontSize);
  const fontFamily  = useSelector(selectFontFamily);

  const shadowEnabled = useSelector(selectShadowEnabled);
  const shadowColor   = useSelector(selectShadowColor);
  const shadowBlur    = useSelector(selectShadowBlur);
  const shadowOffsetX = useSelector(selectShadowOffsetX);
  const shadowOffsetY = useSelector(selectShadowOffsetY);

  useEffect(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    // ── Build Shadow Object ──────────────────────────────────────────────────
    const shadowObj = shadowEnabled
      ? new Shadow({
          color: shadowColor,
          blur: shadowBlur || 0.1,
          offsetX: shadowOffsetX,
          offsetY: shadowOffsetY,
          affectStroke: true,
        })
      : null;

    // ── Update Free Drawing Brush live ───────────────────────────────────────
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      if (FREE_BRUSH_TOOLS.includes(activeTool)) {
        const brush = canvas.freeDrawingBrush;
        // All custom + built-in brushes expose .color, .width, .opacity
        brush.color   = hexToRgba(strokeColor, opacity);
        brush.width   = strokeWidth;
        brush.opacity = opacity;
        brush.shadow  = shadowObj;


        if (activeTool === 'spray-dense') {
          brush.density = Math.min(brushDensity * 3, 100);
        }

        // Ribbon spread tracks strokeWidth
        if (activeTool === 'ribbon') {
          brush.spread = Math.max(6, strokeWidth * 2.5);
        }

        // Ink min-width
        if (activeTool === 'ink') {
          brush.minWidth = Math.max(1, strokeWidth * 0.25);
        }
      } else if (activeTool === 'eraser') {
        canvas.freeDrawingBrush.width  = strokeWidth * 4;
        canvas.freeDrawingBrush.shadow = null;
      }
    }

    // ── Update Selected Canvas Object(s) ─────────────────────────────────────
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      let changed = false;

      activeObjects.forEach((obj) => {
        const base = { opacity, shadow: shadowObj, dirty: true };

        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'FabricText') {
          obj.set({ ...base, fill: strokeColor, fontSize, fontFamily });
          changed = true;
        } else if (obj.type === 'path') {
          obj.set({ ...base, stroke: strokeColor, strokeWidth });
          changed = true;
        } else if (['rect', 'circle', 'triangle', 'line', 'polygon', 'ellipse'].includes(obj.type)) {
          obj.set({ ...base, fill: fillColor, stroke: strokeColor, strokeWidth });
          changed = true;
        }
      });

      if (changed) canvas.requestRenderAll();
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
