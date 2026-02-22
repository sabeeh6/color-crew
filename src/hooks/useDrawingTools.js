// src/hooks/useDrawingTools.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PencilBrush,
  SprayBrush,
  CircleBrush,
  Rect,
  Circle,
  Triangle,
  Line,
  FabricText,
} from 'fabric';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { setActiveTool } from '../store/slices/canvasSlice';
import {
  selectStrokeColor,
  selectFillColor,
  selectStrokeWidth,
  selectOpacity,
  selectBrushDensity,
  selectFontSize,
  selectFontFamily,
} from '../store/slices/toolSlice';

export const useDrawingTools = () => {
  const dispatch = useDispatch();

  // Read tool settings from Redux
  const strokeColor = useSelector(selectStrokeColor);
  const fillColor = useSelector(selectFillColor);
  const strokeWidth = useSelector(selectStrokeWidth);
  const opacity = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);
  const fontSize = useSelector(selectFontSize);
  const fontFamily = useSelector(selectFontFamily);

  const activatePencil = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new PencilBrush(canvas);
    brush.color = strokeColor;
    brush.width = strokeWidth;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    canvas.selection = false;
    dispatch(setActiveTool('pencil'));
  }, [strokeColor, strokeWidth, dispatch]);

  const activateSpray = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new SprayBrush(canvas);
    brush.color = strokeColor;
    brush.width = strokeWidth;
    brush.density = brushDensity;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    canvas.selection = false;
    dispatch(setActiveTool('spray'));
  }, [strokeColor, strokeWidth, brushDensity, dispatch]);

  const activateCircleBrush = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new CircleBrush(canvas);
    brush.color = strokeColor;
    brush.width = strokeWidth;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    dispatch(setActiveTool('circle-brush'));
  }, [strokeColor, strokeWidth, dispatch]);

  const activateEraser = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    // Eraser simulated with white PencilBrush over background color
    const brush = new PencilBrush(canvas);
    brush.color = canvas.backgroundColor || '#ffffff';
    brush.width = strokeWidth * 4;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    dispatch(setActiveTool('eraser'));
  }, [strokeWidth, dispatch]);

  const activateSelect = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    dispatch(setActiveTool('select'));
  }, [dispatch]);

  const addRectangle = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const rect = new Rect({
      left: 160,
      top: 160,
      width: 120,
      height: 80,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    dispatch(setActiveTool('rect'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addCircle = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const circle = new Circle({
      left: 160,
      top: 160,
      radius: 50,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    dispatch(setActiveTool('circle'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addTriangle = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const triangle = new Triangle({
      left: 160,
      top: 160,
      width: 100,
      height: 100,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.renderAll();
    dispatch(setActiveTool('triangle'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addLine = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const line = new Line([60, 60, 220, 220], {
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
    dispatch(setActiveTool('line'));
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  const addText = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const text = new FabricText('Type here...', {
      left: 160,
      top: 160,
      fontSize,
      fontFamily,
      fill: strokeColor,
      opacity,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    dispatch(setActiveTool('text'));
  }, [strokeColor, fontSize, fontFamily, opacity, dispatch]);

  const clearCanvas = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
  }, []);

  return {
    activatePencil,
    activateSpray,
    activateCircleBrush,
    activateEraser,
    activateSelect,
    addRectangle,
    addCircle,
    addTriangle,
    addLine,
    addText,
    clearCanvas,
  };
};