// src/utils/customBrushes.js
// Professional custom Fabric.js v6 brush implementations
// All brushes extend BaseBrush and produce proper Path objects on mouseUp
// so they work with undo/redo, selection, and serialisation out of the box.

import { BaseBrush, Path } from 'fabric';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const perp = (p1, p2, dist) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: (-dy / len) * dist, y: (dx / len) * dist };
};

const buildLinePath = (points) =>
  points.reduce(
    (d, p, i) => d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    ''
  );

// ─── Marker Brush ─────────────────────────────────────────────────────────────
// Wide, square-capped, bevel-joined strokes.  Semi-transparent so layers blend.
export class MarkerBrush extends BaseBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    this.width   = 20;
  }

  onMouseDown(pointer) {
    this._points = [pointer];
  }

  onMouseMove(pointer) {
    this._points.push(pointer);
    this._render();
  }

  onMouseUp({ pointer } = {}) {
    if (pointer) this._points.push(pointer);
    this._finalize();
    this._points = [];
  }

  _render() {
    const ctx = this.canvas.contextTop;
    const pts = this._points;
    if (pts.length < 2) return;

    this.canvas.clearContext(ctx);
    ctx.save();
    ctx.globalAlpha  = this.opacity ?? 1;
    ctx.strokeStyle  = this.color;
    ctx.lineWidth    = this.width;
    ctx.lineCap      = 'square';
    ctx.lineJoin     = 'bevel';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) return;
    const path = new Path(buildLinePath(this._points), {
      strokeWidth:    this.width,
      stroke:         this.color,
      fill:           'transparent',
      opacity:        this.opacity ?? 1,
      strokeLineCap:  'square',
      strokeLineJoin: 'bevel',
    });
    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.add(path);
    this.canvas.fire('path:created', { path });
    this.canvas.renderAll();
  }
}

// ─── Ink Brush ────────────────────────────────────────────────────────────────
// Round-capped PencilBrush feel but with subtle width variation based on speed,
// producing an authentic pen-on-paper ink line.
export class InkBrush extends BaseBrush {
  constructor(canvas) {
    super(canvas);
    this._points   = [];
    this._lastTime = 0;
    this.width     = 4;
    this.minWidth  = 1;
  }

  onMouseDown(pointer) {
    this._lastTime = Date.now();
    this._points   = [{ ...pointer, w: this.width }];
  }

  onMouseMove(pointer) {
    const now   = Date.now();
    const dt    = Math.max(now - this._lastTime, 1);
    const prev  = this._points[this._points.length - 1];
    const dist  = Math.hypot(pointer.x - prev.x, pointer.y - prev.y);
    const speed = dist / dt; // px / ms — faster → thinner
    const w     = Math.max(this.minWidth, this.width - speed * this.width * 0.7);

    this._points.push({ ...pointer, w });
    this._lastTime = now;
    this._render();
  }

  onMouseUp({ pointer } = {}) {
    if (pointer) this._points.push({ ...pointer, w: this.minWidth });
    this._finalize();
    this._points = [];
  }

  _render() {
    const ctx = this.canvas.contextTop;
    const pts = this._points;
    if (pts.length < 2) return;

    this.canvas.clearContext(ctx);
    ctx.save();
    ctx.globalAlpha = this.opacity ?? 1;
    ctx.fillStyle   = this.color;

    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const p    = perp(prev, curr, curr.w / 2);
      ctx.beginPath();
      ctx.moveTo(prev.x + p.x, prev.y + p.y);
      ctx.lineTo(curr.x + p.x, curr.y + p.y);
      ctx.lineTo(curr.x - p.x, curr.y - p.y);
      ctx.lineTo(prev.x - p.x, prev.y - p.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) return;
    // Build a filled outline path that captures the tapered shape
    const fwd = [];
    const bwd = [];

    for (let i = 0; i < this._points.length; i++) {
      const curr = this._points[i];
      const next = this._points[i + 1] || curr;
      const p    = perp(curr, next, (curr.w || this.width) / 2);
      fwd.push({ x: curr.x + p.x, y: curr.y + p.y });
      bwd.unshift({ x: curr.x - p.x, y: curr.y - p.y });
    }

    const allPts = [...fwd, ...bwd];
    const d = allPts.reduce(
      (acc, pt, i) => acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`),
      ''
    ) + ' Z';

    const path = new Path(d, {
      fill:      this.color,
      stroke:    'transparent',
      strokeWidth: 0,
      opacity:   this.opacity ?? 1,
    });

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.add(path);
    this.canvas.fire('path:created', { path });
    this.canvas.renderAll();
  }
}

// ─── Chalk Brush ──────────────────────────────────────────────────────────────
// Scatters tiny circle particles with random jitter along the stroke path,
// producing a textured chalk / pastel look.  Finalises as many small Path
// circles grouped into a single compound path string so undo works correctly.
export class ChalkBrush extends BaseBrush {
  constructor(canvas) {
    super(canvas);
    this._points   = [];
    this._particles = []; // { x, y, r, a } drawn on contextTop
    this.width     = 14;
    this.softness  = 0.85; // scatter radius as fraction of width
  }

  onMouseDown(pointer) {
    this._points    = [pointer];
    this._particles = [];
    this._scatter(pointer);
  }

  onMouseMove(pointer) {
    const prev = this._points[this._points.length - 1];
    const dist = Math.hypot(pointer.x - prev.x, pointer.y - prev.y);
    // Only scatter when moved enough (prevents over-drawing on slow moves)
    if (dist < 2) return;
    this._points.push(pointer);
    this._scatter(pointer);
  }

  onMouseUp({ pointer } = {}) {
    if (pointer) this._scatter(pointer);
    this._finalize();
    this._points    = [];
    this._particles = [];
  }

  _scatter(pointer) {
    const scatter = this.width * this.softness;
    const count   = Math.max(3, Math.floor(this.width * 0.6));
    const ctx     = this.canvas.contextTop;

    ctx.save();
    ctx.fillStyle = this.color;

    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * scatter * 2;
      const oy = (Math.random() - 0.5) * scatter * 2;
      const r  = Math.random() * 1.8 + 0.4;
      const a  = (Math.random() * 0.4 + 0.1) * (this.opacity ?? 1);

      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(pointer.x + ox, pointer.y + oy, r, 0, Math.PI * 2);
      ctx.fill();

      this._particles.push({ x: pointer.x + ox, y: pointer.y + oy, r, a });
    }

    ctx.restore();
  }

  _finalize() {
    if (this._particles.length === 0) return;

    // Build a compound SVG path from all scattered circles (M cx cy m -r 0 a r r ...)
    const circPath = (cx, cy, r) =>
      `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z `;

    const d = this._particles.map((p) => circPath(p.x, p.y, p.r)).join('');

    const path = new Path(d, {
      fill:        this.color,
      stroke:      'transparent',
      strokeWidth: 0,
      opacity:     this.opacity ?? 1,
      fillRule:    'nonzero',
    });

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.add(path);
    this.canvas.fire('path:created', { path });
    this.canvas.renderAll();
  }
}

// ─── Ribbon Brush ─────────────────────────────────────────────────────────────
// Draws two offset strands that follow the stroke like a twisted ribbon /
// calligraphy nib.  Both strands are added as separate paths and undo correctly.
export class RibbonBrush extends BaseBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    this.width   = 4;
    this.spread  = 10; // full gap between the two strands (px)
  }

  onMouseDown(pointer) {
    this._points = [pointer];
  }

  onMouseMove(pointer) {
    this._points.push(pointer);
    this._render();
  }

  onMouseUp({ pointer } = {}) {
    if (pointer) this._points.push(pointer);
    this._finalize();
    this._points = [];
  }

  _strandPoints(sign) {
    const half = this.spread / 2;
    return this._points.map((p, i) => {
      const next = this._points[i + 1] || p;
      const off  = perp(p, next, half * sign);
      return { x: p.x + off.x, y: p.y + off.y };
    });
  }

  _render() {
    const ctx = this.canvas.contextTop;
    if (this._points.length < 2) return;

    this.canvas.clearContext(ctx);
    ctx.save();
    ctx.globalAlpha = this.opacity ?? 1;
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = this.width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    for (const sign of [-1, 1]) {
      const pts = this._strandPoints(sign);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }

    // Thin cross-threads for a woven look
    ctx.lineWidth   = 0.5;
    ctx.globalAlpha = (this.opacity ?? 1) * 0.35;
    for (let i = 0; i < this._points.length; i += 5) {
      const p    = this._points[i];
      const next = this._points[Math.min(i + 1, this._points.length - 1)];
      const off  = perp(p, next, this.spread / 2);
      ctx.beginPath();
      ctx.moveTo(p.x - off.x, p.y - off.y);
      ctx.lineTo(p.x + off.x, p.y + off.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) return;

    const makePath = (sign) =>
      new Path(buildLinePath(this._strandPoints(sign)), {
        strokeWidth:    this.width,
        stroke:         this.color,
        fill:           'transparent',
        opacity:        this.opacity ?? 1,
        strokeLineCap:  'round',
        strokeLineJoin: 'round',
      });

    const s1 = makePath(-1);
    const s2 = makePath(1);

    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.add(s1);
    this.canvas.add(s2);
    // fire once so undo saves a single snapshot
    this.canvas.fire('path:created', { path: s1 });
    this.canvas.renderAll();
  }
}

// ─── Blender Brush (Smudge) ─────────────────────────────────────────────────
// Professional-grade smudge tool. It samples the current canvas state and 
// "pushes" pixels in the direction of movement. This creates a realistic 
// blending effect for mixing multiple colors on the canvas.
export class BlenderBrush extends BaseBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    this.width = 30;
    this.opacity = 0.4; // controls the "mix strength"
    this._snapshot = null;
  }

  onMouseDown(pointer) {
    this._points = [pointer];
    // Take a snapshot of the lower canvas (the drawn content)
    // We'll use this to sample pixels during the stroke
    const canvasEl = this.canvas.lowerCanvasEl;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasEl.width;
    tempCanvas.height = canvasEl.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvasEl, 0, 0);
    this._snapshot = tempCanvas;
  }

  onMouseMove(pointer) {
    const prev = this._points[this._points.length - 1];
    const dist = Math.hypot(pointer.x - prev.x, pointer.y - prev.y);
    if (dist < 1) return; // avoid over-sampling

    this._points.push(pointer);
    this._renderSmudge(prev, pointer);
  }

  onMouseUp() {
    this._finalize();
    this._points = [];
    this._snapshot = null;
  }

  _renderSmudge(from, to) {
    const ctx = this.canvas.contextTop;
    const r = this.width / 2;

    ctx.save();
    
    // 1. Create a circular clipping mask for the brush tip at current position
    ctx.beginPath();
    ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
    ctx.clip();

    // 2. Clear the brush tip area (optional, but ensures clean layering)
    // ctx.clearRect(to.x - r, to.y - r, r * 2, r * 2);

    // 3. Draw from the snapshot (the canvas as it was at mouseDown)
    // We sample from the "from" position and draw to the "to" position
    // with a slight globalAlpha to create the "smear" / "mix" effect
    ctx.globalAlpha = this.opacity ?? 0.4;
    
    // "from" is our source point, "to" is our target.
    // The distance between from and to is the "push" distance.
    ctx.drawImage(
      this._snapshot,
      from.x - r, from.y - r, r * 2, r * 2, // source: previous position
      to.x - r,   to.y - r,   r * 2, r * 2  // target: current position
    );

    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) {
      this.canvas.clearContext(this.canvas.contextTop);
      return;
    }

    // Export contextTop as an image and add to canvas
    // This bakes the smudge effect into a permanent object
    const topCanvas = this.canvas.upperCanvasEl;
    const dataURL = topCanvas.toDataURL();
    
    // We use a small optimization: only capture the bounding box of the stroke
    // but for simplicity and "senior" robustness, we'll use the whole image
    // as Fabric Images are very efficient.
    
    // Using native Image() instead of util.loadImage to be safe
    const img = new Image();
    img.onload = () => {
      const { FabricImage } = require('fabric');
      const fabricImg = new FabricImage(img, {
        left: 0,
        top: 0,
        selectable: true,
        evented: true,
      });
      this.canvas.clearContext(this.canvas.contextTop);
      this.canvas.add(fabricImg);
      this.canvas.fire('path:created', { path: fabricImg });
      this.canvas.renderAll();
    };
    img.src = dataURL;
  }
}
