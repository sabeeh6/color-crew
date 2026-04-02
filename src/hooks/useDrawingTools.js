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
import { MarkerBrush, InkBrush, ChalkBrush, RibbonBrush, BlenderBrush } from '../utils/customBrushes';
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
import { hexToRgba } from '../utils/colorUtils';

export const useDrawingTools = () => {
  const dispatch = useDispatch();

  const strokeColor = useSelector(selectStrokeColor);
  const fillColor   = useSelector(selectFillColor);
  const strokeWidth = useSelector(selectStrokeWidth);
  const opacity     = useSelector(selectOpacity);
  const brushDensity = useSelector(selectBrushDensity);
  const fontSize    = useSelector(selectFontSize);
  const fontFamily  = useSelector(selectFontFamily);

  // ── Helper: shared brush setup ─────────────────────────────────────────────
  const _setupBrush = (canvas, brush, toolId) => {
    brush.color   = hexToRgba(strokeColor, opacity);
    brush.width   = strokeWidth;
    brush.opacity = opacity;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode    = true;
    canvas.selection        = false;
    dispatch(setActiveTool(toolId));
  };

  // ── Pencil ─────────────────────────────────────────────────────────────────
  const activatePencil = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new PencilBrush(canvas);
    brush.decimate = 2; // smooth path by removing close points
    _setupBrush(canvas, brush, 'pencil');
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  // ── Ink ────────────────────────────────────────────────────────────────────
  const activateInk = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush      = new InkBrush(canvas);
    brush.minWidth   = Math.max(1, strokeWidth * 0.25);
    _setupBrush(canvas, brush, 'ink');
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  // ── Marker ─────────────────────────────────────────────────────────────────
  const activateMarker = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new MarkerBrush(canvas);
    _setupBrush(canvas, brush, 'marker');
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  // ── Chalk ──────────────────────────────────────────────────────────────────
  const activateChalk = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush      = new ChalkBrush(canvas);
    brush.softness   = 0.85;
    _setupBrush(canvas, brush, 'chalk');
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  // ── Ribbon ─────────────────────────────────────────────────────────────────
  const activateRibbon = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush   = new RibbonBrush(canvas);
    brush.spread  = Math.max(6, strokeWidth * 2.5);
    _setupBrush(canvas, brush, 'ribbon');
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  // ── Blender (Smudge) ───────────────────────────────────────────────────────
  const activateBlend = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new BlenderBrush(canvas);
    // Blender doesn't use color, but we'll set it just in case of future changes
    brush.color = 'transparent'; 
    brush.width = strokeWidth;
    brush.opacity = opacity; // mix strength
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode = true;
    canvas.selection = false;
    dispatch(setActiveTool('blend'));
  }, [strokeWidth, opacity, dispatch]);

  // ── Spray (soft) ───────────────────────────────────────────────────────────
  const activateSpray = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush      = new SprayBrush(canvas);
    brush.density    = brushDensity;
    brush.dotWidth   = 1.5;
    _setupBrush(canvas, brush, 'spray');
  }, [strokeColor, strokeWidth, opacity, brushDensity, dispatch]);

  // ── Spray Dense ────────────────────────────────────────────────────────────
  const activateSprayDense = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush      = new SprayBrush(canvas);
    brush.density    = Math.min(brushDensity * 3, 100);
    brush.dotWidth   = 1;
    brush.randomOpacity = true;
    _setupBrush(canvas, brush, 'spray-dense');
  }, [strokeColor, strokeWidth, opacity, brushDensity, dispatch]);

  // ── Circle Brush ───────────────────────────────────────────────────────────
  const activateCircleBrush = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush = new CircleBrush(canvas);
    _setupBrush(canvas, brush, 'circle-brush');
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  // ── Eraser ─────────────────────────────────────────────────────────────────
  const activateEraser = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const brush       = new PencilBrush(canvas);
    brush.color       = canvas.backgroundColor || '#ffffff';
    brush.width       = strokeWidth * 4;
    canvas.freeDrawingBrush = brush;
    canvas.isDrawingMode    = true;
    dispatch(setActiveTool('eraser'));
  }, [strokeWidth, dispatch]);

  // ── Select ─────────────────────────────────────────────────────────────────
  const activateSelect = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode    = false;
    canvas.selection        = true;
    canvas.defaultCursor    = 'default';
    dispatch(setActiveTool('select'));
  }, [dispatch]);

  // ── Shapes ─────────────────────────────────────────────────────────────────
  const addRectangle = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const rect = new Rect({ left: 160, top: 160, width: 120, height: 80, fill: fillColor, stroke: strokeColor, strokeWidth, opacity });
    canvas.add(rect); canvas.setActiveObject(rect); canvas.renderAll();
    dispatch(setActiveTool('rect'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addCircle = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const circle = new Circle({ left: 160, top: 160, radius: 50, fill: fillColor, stroke: strokeColor, strokeWidth, opacity });
    canvas.add(circle); canvas.setActiveObject(circle); canvas.renderAll();
    dispatch(setActiveTool('circle'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addTriangle = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const triangle = new Triangle({ left: 160, top: 160, width: 100, height: 100, fill: fillColor, stroke: strokeColor, strokeWidth, opacity });
    canvas.add(triangle); canvas.setActiveObject(triangle); canvas.renderAll();
    dispatch(setActiveTool('triangle'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addLine = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const line = new Line([60, 60, 220, 220], { stroke: strokeColor, strokeWidth, opacity });
    canvas.add(line); canvas.setActiveObject(line); canvas.renderAll();
    dispatch(setActiveTool('line'));
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  const addText = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const text = new FabricText('Type here...', { left: 160, top: 160, fontSize, fontFamily, fill: strokeColor, opacity });
    canvas.add(text); canvas.setActiveObject(text); canvas.renderAll();
    dispatch(setActiveTool('text'));
  }, [strokeColor, fontSize, fontFamily, opacity, dispatch]);

  const addStar = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const numPoints = 5, outerRadius = 50, innerRadius = 25;
    const points = [];
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / numPoints;
      points.push({ x: Math.cos(angle - Math.PI / 2) * radius, y: Math.sin(angle - Math.PI / 2) * radius });
    }
    const star = new Polygon(points, { left: 160, top: 160, fill: fillColor, stroke: strokeColor, strokeWidth, opacity });
    canvas.add(star); canvas.setActiveObject(star); canvas.renderAll();
    dispatch(setActiveTool('star'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addHeart = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const heart = new Path('M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z', {
      left: 160, top: 160, scaleX: 1.2, scaleY: 1.2, fill: fillColor, stroke: strokeColor, strokeWidth, opacity,
    });
    canvas.add(heart); canvas.setActiveObject(heart); canvas.renderAll();
    dispatch(setActiveTool('heart'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addArrow = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const arrow = new Path('M 0 0 L 40 0 L 40 -10 L 60 10 L 40 30 L 40 20 L 0 20 Z', {
      left: 160, top: 160, fill: fillColor, stroke: strokeColor, strokeWidth, opacity,
    });
    canvas.add(arrow); canvas.setActiveObject(arrow); canvas.renderAll();
    dispatch(setActiveTool('arrow'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addHexagon = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      points.push({ x: Math.cos(angle) * 50, y: Math.sin(angle) * 50 });
    }
    const hexagon = new Polygon(points, { left: 160, top: 160, fill: fillColor, stroke: strokeColor, strokeWidth, opacity });
    canvas.add(hexagon); canvas.setActiveObject(hexagon); canvas.renderAll();
    dispatch(setActiveTool('hexagon'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addEllipse = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const ellipse = new Ellipse({ left: 160, top: 160, rx: 60, ry: 35, fill: fillColor, stroke: strokeColor, strokeWidth, opacity });
    canvas.add(ellipse); canvas.setActiveObject(ellipse); canvas.renderAll();
    dispatch(setActiveTool('ellipse'));
  }, [fillColor, strokeColor, strokeWidth, opacity, dispatch]);

  const addRing = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const ring = new Circle({ left: 160, top: 160, radius: 40, fill: 'transparent', stroke: strokeColor, strokeWidth: 8, opacity });
    canvas.add(ring); canvas.setActiveObject(ring); canvas.renderAll();
    dispatch(setActiveTool('ring'));
  }, [strokeColor, opacity, dispatch]);

  const addArc = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const arc = new Circle({ left: 160, top: 160, radius: 50, startAngle: 0, endAngle: Math.PI, fill: 'transparent', stroke: strokeColor, strokeWidth, opacity });
    canvas.add(arc); canvas.setActiveObject(arc); canvas.renderAll();
    dispatch(setActiveTool('arc'));
  }, [strokeColor, strokeWidth, opacity, dispatch]);

  const addCloud = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const cloud = new Path(
      'M20,70 a20,20 0 1,0 40,0 a25,25 0 1,0 50,0 a20,20 0 1,0 40,0 a25,25 0 1,0 50,0 a20,20 0 1,0 0,-40 a25,25 0 1,0 -50,0 a20,20 0 1,0 -40,0 a25,25 0 1,0 -50,0 Z',
      { left: 160, top: 160, scaleX: 0.8, scaleY: 0.8, fill: fillColor, stroke: strokeColor, strokeWidth, opacity }
    );
    canvas.add(cloud); canvas.setActiveObject(cloud); canvas.renderAll();
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
    // Brushes
    activatePencil,
    activateInk,
    activateMarker,
    activateChalk,
    activateRibbon,
    activateBlend,
    activateSpray,
    activateSprayDense,
    activateCircleBrush,
    activateEraser,
    // Navigation
    activateSelect,
    // Shapes
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