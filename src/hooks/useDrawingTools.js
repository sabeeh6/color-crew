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
  Ellipse,
  Polygon,
  Path,
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

  // ── New Konva-style shapes ──────────────────────────────────────────────────

  const addStar = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const numPoints = 5;
    const outerRadius = 50;
    const innerRadius = 25;
    const points = [];

    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / numPoints;
      points.push({
        x: Math.cos(angle - Math.PI / 2) * radius,
        y: Math.sin(angle - Math.PI / 2) * radius,
      });
    }

    const star = new Polygon(points, {
      left: 160,
      top: 160,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.renderAll();
    dispatch(setActiveTool('star'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addHeart = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const heartPath =
      'M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z';

    const heart = new Path(heartPath, {
      left: 160,
      top: 160,
      scaleX: 1.2,
      scaleY: 1.2,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(heart);
    canvas.setActiveObject(heart);
    canvas.renderAll();
    dispatch(setActiveTool('heart'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addArrow = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const arrowPath = 'M 0 0 L 40 0 L 40 -10 L 60 10 L 40 30 L 40 20 L 0 20 Z';

    const arrow = new Path(arrowPath, {
      left: 160,
      top: 160,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(arrow);
    canvas.setActiveObject(arrow);
    canvas.renderAll();
    dispatch(setActiveTool('arrow'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addHexagon = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const points = [];
    const size = 50;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      points.push({
        x: Math.cos(angle) * size,
        y: Math.sin(angle) * size,
      });
    }

    const hexagon = new Polygon(points, {
      left: 160,
      top: 160,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(hexagon);
    canvas.setActiveObject(hexagon);
    canvas.renderAll();
    dispatch(setActiveTool('hexagon'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addEllipse = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const ellipse = new Ellipse({
      left: 160,
      top: 160,
      rx: 60,
      ry: 35,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
    canvas.renderAll();
    dispatch(setActiveTool('ellipse'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addRing = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const ring = new Circle({
      left: 160,
      top: 160,
      radius: 40,
      fill: 'transparent',
      stroke: strokeColor, // Default to stroke color
      strokeWidth: 8,
      opacity,
    });

    canvas.add(ring);
    canvas.setActiveObject(ring);
    canvas.renderAll();
    dispatch(setActiveTool('ring'));
  }, [strokeColor, opacity, dispatch]);

  const addArc = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    const arc = new Circle({
      left: 160,
      top: 160,
      radius: 50,
      startAngle: 0,
      endAngle: Math.PI, // 180 degrees
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(arc);
    canvas.setActiveObject(arc);
    canvas.renderAll();
    dispatch(setActiveTool('arc'));
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  const addCloud = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;

    // A more "bubbly" cloud path with curls on all sides
    const bubblyCloudPath =
      'M20,70 a20,20 0 1,0 40,0 a25,25 0 1,0 50,0 a20,20 0 1,0 40,0 a25,25 0 1,0 50,0 a20,20 0 1,0 0,-40 a25,25 0 1,0 -50,0 a20,20 0 1,0 -40,0 a25,25 0 1,0 -50,0 Z';

    const cloud = new Path(bubblyCloudPath, {
      left: 160,
      top: 160,
      scaleX: 0.8, // Adjusted for the larger path data
      scaleY: 0.8,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity,
    });

    canvas.add(cloud);
    canvas.setActiveObject(cloud);
    canvas.renderAll();
    dispatch(setActiveTool('cloud'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

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
    addStar,
    addHeart,
    addArrow,
    addHexagon,
    addEllipse,
    addRing,
    addArc,
    addCloud,
    clearCanvas,
  };
};


