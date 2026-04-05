// src/utils/customBrushes.js
// Production-grade custom Fabric.js v7 brush implementations.
//
// KEY DESIGN RULES (applied to every brush):
//  1. _isDrawing flag — set true on onMouseDown, false on onMouseUp.
//     onMouseMove is a no-op until _isDrawing is true, preventing spurious
//     marks when the pointer glides across the canvas without a click.
//  2. Proper lifecycle: onMouseDown → init; onMouseMove → preview on contextTop;
//     onMouseUp → _finalize() commits a permanent Fabric Path / Image and fires
//     'path:created' so undo/redo, selection and serialisation work out of the box.
//  3. _reset() clears every piece of transient state so a cancelled stroke
//     never bleeds into the next one.

import { BaseBrush, Path, Shadow } from 'fabric';

// ─── Shared geometry helpers ─────────────────────────────────────────────────

/**
 * Returns a perpendicular offset vector of length `dist` for the segment p1→p2.
 * Used to build stroke outlines and parallel tine offsets.
 */
const perp = (p1, p2, dist) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: (-dy / len) * dist, y: (dx / len) * dist };
};

/**
 * Converts an array of {x,y} points into an SVG "M … L …" path string.
 */
const buildLinePath = (points) =>
  points.reduce(
    (d, p, i) => d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    ''
  );

/**
 * SVG circle sub-path (used when building compound paths from dot particles).
 */
const circPath = (cx, cy, r) =>
  `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z `;

// ─── BaseBrush convenience mixin ─────────────────────────────────────────────
// Adds _isDrawing guard and _reset() to any subclass via a small base class.

class GuardedBrush extends BaseBrush {
  constructor(canvas) {
    super(canvas);
    /** @type {boolean} True only while the mouse button is held. */
    this._isDrawing = false;
  }

  /** Call at the top of every onMouseDown to start a stroke. */
  _beginStroke() {
    this._isDrawing = true;
  }

  /** Call at the top of every onMouseUp to end a stroke. */
  _endStroke() {
    this._isDrawing = false;
  }

  /**
   * Commits the current preview (contextTop) as a permanent Fabric object.
   * Subclasses override _finalize(); call _commitPath(path) to add & fire.
   */
  _commitPath(path) {
    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.add(path);
    this.canvas.fire('path:created', { path });
    this.canvas.renderAll();
  }
}

// ─── Marker Brush ─────────────────────────────────────────────────────────────
// Wide, square-capped, bevel-joined strokes. Semi-transparent so layers blend.
export class MarkerBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    this.width   = 20;
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points = [{ x: pointer.x, y: pointer.y }];
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._render();
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    const pointer = options.pointer;
    if (pointer) this._points.push({ x: pointer.x, y: pointer.y });
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
    this._commitPath(path);
  }
}

// ─── Ink Brush ────────────────────────────────────────────────────────────────
// Round-capped stroke with speed-based width variation — slower → thicker.
// Produces an authentic fountain-pen / ink line feel.
export class InkBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points   = [];
    this._lastTime = 0;
    this.width     = 4;
    this.minWidth  = 1;
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._lastTime = Date.now();
    this._points   = [{ x: pointer.x, y: pointer.y, w: this.width }];
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    const now   = Date.now();
    const dt    = Math.max(now - this._lastTime, 1);
    const prev  = this._points[this._points.length - 1];
    const dist  = Math.hypot(pointer.x - prev.x, pointer.y - prev.y);
    const speed = dist / dt;
    const w     = Math.max(this.minWidth, this.width - speed * this.width * 0.7);
    this._points.push({ x: pointer.x, y: pointer.y, w });
    this._lastTime = now;
    this._render();
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    const pointer = options.pointer;
    if (pointer) this._points.push({ x: pointer.x, y: pointer.y, w: this.minWidth });
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
    const fwd = [], bwd = [];
    for (let i = 0; i < this._points.length; i++) {
      const curr = this._points[i];
      const next = this._points[i + 1] || curr;
      const p    = perp(curr, next, (curr.w || this.width) / 2);
      fwd.push({ x: curr.x + p.x, y: curr.y + p.y });
      bwd.unshift({ x: curr.x - p.x, y: curr.y - p.y });
    }
    const all = [...fwd, ...bwd];
    const d   = all.reduce((a, pt, i) => a + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`), '') + ' Z';
    this._commitPath(new Path(d, { fill: this.color, stroke: 'transparent', strokeWidth: 0, opacity: this.opacity ?? 1 }));
  }
}

// ─── Chalk Brush ──────────────────────────────────────────────────────────────
// Scatters tiny circle particles with random jitter to mimic textured chalk.
export class ChalkBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points    = [];
    this._particles = [];
    this.width      = 14;
    this.softness   = 0.85;
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points    = [{ x: pointer.x, y: pointer.y }];
    this._particles = [];
    this._scatter(pointer);
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    const prev = this._points[this._points.length - 1];
    if (Math.hypot(pointer.x - prev.x, pointer.y - prev.y) < 2) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._scatter(pointer);
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    if (options.pointer) this._scatter(options.pointer);
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
      this._particles.push({ x: pointer.x + ox, y: pointer.y + oy, r });
    }
    ctx.restore();
  }

  _finalize() {
    if (!this._particles.length) return;
    const d    = this._particles.map(p => circPath(p.x, p.y, p.r)).join('');
    const path = new Path(d, { fill: this.color, stroke: 'transparent', strokeWidth: 0, opacity: this.opacity ?? 1, fillRule: 'nonzero' });
    this._commitPath(path);
  }
}

// ─── Ribbon Brush ─────────────────────────────────────────────────────────────
// Two parallel offset strands with thin cross-threads for a calligraphic nib look.
export class RibbonBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    this.width   = 4;
    this.spread  = 10; // gap between the two strands (px)
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points = [{ x: pointer.x, y: pointer.y }];
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._render();
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    if (options.pointer) this._points.push({ x: options.pointer.x, y: options.pointer.y });
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
    if (this._points.length < 2) return;
    const ctx = this.canvas.contextTop;
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

    // Cross-threads for woven look
    ctx.lineWidth   = 0.5;
    ctx.globalAlpha = (this.opacity ?? 1) * 0.35;
    for (let i = 0; i < this._points.length; i += 5) {
      const p   = this._points[i];
      const nxt = this._points[Math.min(i + 1, this._points.length - 1)];
      const off = perp(p, nxt, this.spread / 2);
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
        strokeWidth: this.width, stroke: this.color, fill: 'transparent',
        opacity: this.opacity ?? 1, strokeLineCap: 'round', strokeLineJoin: 'round',
      });
    const s1 = makePath(-1);
    const s2 = makePath(1);
    this.canvas.clearContext(this.canvas.contextTop);
    this.canvas.add(s1);
    this.canvas.add(s2);
    this.canvas.fire('path:created', { path: s1 });
    this.canvas.renderAll();
  }
}

// ─── Blender Brush (Smudge) ───────────────────────────────────────────────────
// Samples the canvas at the previous cursor position and paints it at the
// current position — pushing pixels like a finger smudge.
export class BlenderBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points   = [];
    this.width     = 30;
    this.opacity   = 0.4;
    this._snapshot = null;
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points   = [{ x: pointer.x, y: pointer.y }];
    const el  = this.canvas.lowerCanvasEl;
    const tmp = document.createElement('canvas');
    tmp.width  = el.width;
    tmp.height = el.height;
    tmp.getContext('2d').drawImage(el, 0, 0);
    this._snapshot = tmp;
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    const prev = this._points[this._points.length - 1];
    if (Math.hypot(pointer.x - prev.x, pointer.y - prev.y) < 1) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._renderSmudge(prev, pointer);
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    this._finalize();
    this._points   = [];
    this._snapshot = null;
  }

  _renderSmudge(from, to) {
    const ctx = this.canvas.contextTop;
    const r   = this.width / 2;
    const f   = this.canvas.getRetinaScaling ? this.canvas.getRetinaScaling() : 1;
    ctx.save();
    ctx.beginPath();
    ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = this.opacity ?? 0.4;
    // Source requires physical pixels (with retina multiplier), Destination requires logical pixels
    ctx.drawImage(
      this._snapshot, 
      (from.x - r) * f, (from.y - r) * f, r * 2 * f, r * 2 * f, 
      to.x - r, to.y - r, r * 2, r * 2
    );
    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) {
      this.canvas.clearContext(this.canvas.contextTop);
      return;
    }
    
    const f = this.canvas.getRetinaScaling ? this.canvas.getRetinaScaling() : 1;
    
    // Calculate logical bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of this._points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const r = this.width / 2;
    // Pad bounding box for safe capture
    minX = Math.floor(minX - r - 2);
    minY = Math.floor(minY - r - 2);
    maxX = Math.ceil(maxX + r + 2);
    maxY = Math.ceil(maxY + r + 2);
    
    const w = maxX - minX;
    const h = maxY - minY;

    if (w <= 0 || h <= 0) {
      this.canvas.clearContext(this.canvas.contextTop);
      return;
    }

    // Crop precisely to the bounding box footprint
    const cropped = document.createElement('canvas');
    cropped.width = w * f;
    cropped.height = h * f;
    const cropCtx = cropped.getContext('2d');
    
    try {
      cropCtx.drawImage(
        this.canvas.contextTop.canvas,
        minX * f, minY * f, w * f, h * f,
        0, 0, w * f, h * f
      );
    } catch (e) {
      this.canvas.clearContext(this.canvas.contextTop);
      return;
    }
    
    const dataURL = cropped.toDataURL();
    this.canvas.clearContext(this.canvas.contextTop);
    
    const img = new Image();
    img.onload = async () => {
      const { FabricImage } = await import('fabric');
      const fabricImg = new FabricImage(img, { 
        left: minX, 
        top: minY, 
        originX: 'left',
        originY: 'top',
        scaleX: 1 / f,
        scaleY: 1 / f,
        selectable: true, 
        evented: true 
      });
      this.canvas.add(fabricImg);
      this.canvas.fire('path:created', { path: fabricImg });
      this.canvas.renderAll();
    };
    img.src = dataURL;
  }
}

// ─── Dip Pen Brush ────────────────────────────────────────────────────────────
// Velocity-based width variation (slow → thick, fast → thin) with a smooth
// taper at stroke end. Solid, no blur — authentic dip-pen feel.
export class DipPenBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points   = [];
    this._lastTime = 0;
    this.width     = 6;
    this.minWidth  = 1;
    this.taper     = 0.6;
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._lastTime = Date.now();
    this._points   = [{ x: pointer.x, y: pointer.y, w: this.minWidth }];
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    const now   = Date.now();
    const dt    = Math.max(now - this._lastTime, 1);
    const prev  = this._points[this._points.length - 1];
    const dist  = Math.hypot(pointer.x - prev.x, pointer.y - prev.y);
    if (dist < 1.5) return;

    const speed  = dist / dt;
    const target = Math.max(this.minWidth, this.width * (1 - speed * this.taper));
    const w      = Math.min(prev.w * 0.6 + target * 0.4, this.width);
    this._points.push({ x: pointer.x, y: pointer.y, w });
    this._lastTime = now;
    this._render();
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    const pointer = options.pointer;
    if (pointer) {
      const last  = this._points[this._points.length - 1] || pointer;
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        this._points.push({
          x: last.x + (pointer.x - last.x) * t,
          y: last.y + (pointer.y - last.y) * t,
          w: Math.max(0.3, last.w * (1 - t)),
        });
      }
    }
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

    const first = pts[0], last = pts[pts.length - 1];
    ctx.beginPath(); ctx.arc(first.x, first.y, first.w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(last.x,  last.y,  last.w  / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) return;
    const fwd = [], bwd = [];
    for (let i = 0; i < this._points.length; i++) {
      const curr = this._points[i];
      const next = this._points[i + 1] || curr;
      const p    = perp(curr, next, (curr.w || this.width) / 2);
      fwd.push({ x: curr.x + p.x, y: curr.y + p.y });
      bwd.unshift({ x: curr.x - p.x, y: curr.y - p.y });
    }
    const all = [...fwd, ...bwd];
    const d   = all.reduce((a, pt, i) => a + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`), '') + ' Z';
    this._commitPath(new Path(d, { fill: this.color, stroke: 'transparent', strokeWidth: 0, opacity: this.opacity ?? 1 }));
  }
}

// ─── Watercolor Brush ─────────────────────────────────────────────────────────
// Realistic watercolor simulation:
//  • Three concentric scatter layers (outer bleed → mid body → core) give true
//    soft-edge paint bleeding on paper.
//  • Each dot has independent random opacity so the pigment feels uneven.
//  • A Fabric shadow on the finalized path blurs the whole stroke like wet paint.
//  • The stroke also includes a spine of translucent wider circles so the centre
//    is slightly more saturated than the bleed edge.
export class WatercolorBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points    = [];
    this._particles = []; // { x, y, r, a } accumulated for _finalize
    this.width      = 30;
    this.spread     = 0.9;  // bleed radius as fraction of width
    this.wetness    = 0.55; // overall pigment density (0-1)
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points    = [{ x: pointer.x, y: pointer.y }];
    this._particles = [];
    this._deposit(pointer);
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    const prev = this._points[this._points.length - 1];
    const dist  = Math.hypot(pointer.x - prev.x, pointer.y - prev.y);
    const steps = Math.max(1, Math.ceil(dist / (this.width * 0.25)));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const interp = {
        x: prev.x + (pointer.x - prev.x) * t,
        y: prev.y + (pointer.y - prev.y) * t,
      };
      if (Math.hypot(interp.x - prev.x, interp.y - prev.y) >= 2) {
        this._points.push(interp);
        this._deposit(interp);
      }
    }
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    if (options.pointer) this._deposit(options.pointer);
    this._finalize();
    this._points    = [];
    this._particles = [];
  }

  /**
   * Deposits watercolor pigment at `pointer`.
   * Three concentric rings simulate outer bleed, mid-body, and a saturated core.
   */
  _deposit(pointer) {
    const ctx       = this.canvas.contextTop;
    const w         = this.width;
    const baseAlpha = this.wetness * (this.opacity ?? 1);

    // Layer definition: [radiusFraction, maxAlphaFraction, dotCountFraction]
    const layers = [
      { rf: 1.1,  af: 0.15, cf: 1.2  }, // bleed edge — wider, very faint
      { rf: 0.7,  af: 0.28, cf: 0.8  }, // mid body
      { rf: 0.35, af: 0.45, cf: 0.5  }, // core — concentrated pigment
    ];

    ctx.save();
    ctx.fillStyle = this.color;

    for (const layer of layers) {
      // FIX 1: Limit count to prevent "Path Bloat" that freezes JSON serialization.
      // Maximum 50 particles per move event regardless of width.
      const count = Math.min(50, Math.max(1, Math.floor(w * layer.cf)));
      for (let i = 0; i < count; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * w * layer.rf * this.spread;
        const ox     = Math.cos(angle) * radius;
        const oy     = Math.sin(angle) * radius;
        const r = (Math.random() * 2 + 1) * (1 + (1 - layer.rf) * 0.8);
        const a = baseAlpha * layer.af * (0.5 + Math.random() * 0.5);

        ctx.globalAlpha = Math.min(a, 1);
        ctx.beginPath();
        ctx.arc(pointer.x + ox, pointer.y + oy, r, 0, Math.PI * 2);
        ctx.fill();

        this._particles.push({ x: pointer.x + ox, y: pointer.y + oy, r, a });
      }
    }

    // Spine: slightly richer core spine
    ctx.globalAlpha = baseAlpha * 0.25;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
    this._particles.push({ x: pointer.x, y: pointer.y, r: w * 0.4, a: baseAlpha * 0.25 });

    ctx.restore();
  }

  _finalize() {
    // FIX 2: Limit total particles in the final Path to 2500. 
    // This prevents JSON.stringify/parse from freezing the UI when finishing a long stroke.
    if (!this._particles.length) return;
    const finalParticles = this._particles.length > 2500 
      ? this._particles.filter((_, idx) => idx % Math.ceil(this._particles.length / 2500) === 0)
      : this._particles;

    const d    = finalParticles.map(p => circPath(p.x, p.y, p.r)).join('');
    const path = new Path(d, {
      fill:        this.color,
      stroke:      'transparent',
      strokeWidth: 0,
      opacity:     Math.min(this.wetness * (this.opacity ?? 1) * 0.5, 1),
      fillRule:    'nonzero',
    });

    // FIX 3: Use genuine fabric.Shadow class for reliable serialization
    path.shadow = new Shadow({
      color:   this.color,
      blur:    Math.max(12, this.width * 0.6),
      offsetX: 0,
      offsetY: 0,
      affectStroke: false,
    });
    this._commitPath(path);
  }
}

// ─── AirBrush ─────────────────────────────────────────────────────────────────
// Adjustable-density spray with a Gaussian-ish falloff from center.
// Uses `density` (particles per move event) driven by the Redux brushDensity slider.
export class AirBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points    = [];
    this._particles = [];
    this.width      = 40;
    this.density    = 30;
    this.softness   = 0.7;  // alpha falloff from center (0 = hard, 1 = very soft)
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points    = [{ x: pointer.x, y: pointer.y }];
    this._particles = [];
    this._spray(pointer);
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._spray(pointer);
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    if (options.pointer) this._spray(options.pointer);
    this._finalize();
    this._points    = [];
    this._particles = [];
  }

  _spray(pointer) {
    const ctx = this.canvas.contextTop;
    const r   = this.width / 2;
    ctx.save();
    ctx.fillStyle = this.color;

    for (let i = 0; i < Math.min(this.density, 40); i++) {
      // Sum of 3 uniforms → bell-curve-ish distribution
      const angle  = Math.random() * Math.PI * 2;
      const dist   = ((Math.random() + Math.random() + Math.random()) / 3) * r;
      const ox     = Math.cos(angle) * dist;
      const oy     = Math.sin(angle) * dist;
      const alpha  = (1 - (dist / r) * this.softness) * (this.opacity ?? 1) * 0.5;
      const dotR   = Math.random() * 1.5 + 0.3;
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(pointer.x + ox, pointer.y + oy, dotR, 0, Math.PI * 2);
      ctx.fill();
      this._particles.push({ x: pointer.x + ox, y: pointer.y + oy, r: dotR });
    }
    ctx.restore();
  }

  _finalize() {
    if (!this._particles.length) return;
    const d = this._particles.map(p => circPath(p.x, p.y, p.r)).join('');
    this._commitPath(new Path(d, {
      fill: this.color, stroke: 'transparent', strokeWidth: 0,
      opacity: (this.opacity ?? 1) * 0.45, fillRule: 'nonzero',
    }));
  }
}

// ─── Hard Round Brush ─────────────────────────────────────────────────────────
// Solid, fully opaque stroke with smooth quadratic-curve interpolation.
// No blur, no texture — perfect for inking or bold outlines.
export class HardRoundBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    this.width   = 12;
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points = [{ x: pointer.x, y: pointer.y }];
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    const prev = this._points[this._points.length - 1];
    if (Math.hypot(pointer.x - prev.x, pointer.y - prev.y) < 1) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._render();
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    if (options.pointer) this._points.push({ x: options.pointer.x, y: options.pointer.y });
    this._finalize();
    this._points = [];
  }

  /** Smooth quadratic interpolation through midpoints (Catmull–Rom style). */
  _buildPath(ctx_or_null) {
    const pts = this._points;
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    if (pts.length === 2) {
      d += ` L ${pts[1].x} ${pts[1].y}`;
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
      }
      d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    }
    return d;
  }

  _render() {
    const ctx = this.canvas.contextTop;
    const pts = this._points;
    if (pts.length < 2) return;

    this.canvas.clearContext(ctx);
    ctx.save();
    ctx.globalAlpha  = 1;
    ctx.strokeStyle  = this.color;
    ctx.lineWidth    = this.width;
    ctx.lineCap      = 'round';
    ctx.lineJoin     = 'round';

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length === 2) {
      ctx.lineTo(pts[1].x, pts[1].y);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) return;
    const d = this._buildPath();
    this._commitPath(new Path(d, {
      strokeWidth: this.width, stroke: this.color, fill: 'transparent',
      opacity: 1, strokeLineCap: 'round', strokeLineJoin: 'round',
    }));
  }
}

// ─── Hair (Rake) Brush ────────────────────────────────────────────────────────
// Simulates a flat paint brush / rake dragged through wet paint.
//
// Improvements over v1:
//  • Per-tine opacity variation — outer hairs are lighter, giving a natural falloff.
//  • Per-tine width variation — centre strand is slightly thicker.
//  • Per-tine lateral jitter — hair positions shift very slightly each frame,
//    mimicking the elasticity of real bristles.
//  • Higher default tine count (12) with denser packing for a lush hair feel.
//  • Quadratic-curve interpolation for each strand (smooth, not spiky).
export class HairBrush extends GuardedBrush {
  constructor(canvas) {
    super(canvas);
    this._points = [];
    // Stroke-level tine data initialised in onMouseDown
    this._tines  = [];
    this.width     = 32;   // increased default footprint
    this.tines     = 16;   // higher tine count for denser strands
    this.tineWidth = 0.6;  // thinner hairs for realistic look
    this.jitter    = 0.15; // increased jitter for realism
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points = [{ x: pointer.x, y: pointer.y }];
    // Generate per-tine profile once per stroke so it stays consistent
    this._tines = this._buildTineProfile();
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return; // ← guard
    const prev = this._points[this._points.length - 1];
    if (Math.hypot(pointer.x - prev.x, pointer.y - prev.y) < 1.5) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._render();
  }

  onMouseUp(opts = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    if (opts.pointer) this._points.push({ x: opts.pointer.x, y: opts.pointer.y });
    this._finalize();
    this._points = [];
    this._tines  = [];
  }

  /**
   * Build one profile entry per tine. The profile is stable across the whole
   * stroke — only the pointer position moves, which is accumulated below.
   */
  _buildTineProfile() {
    const half   = this.width / 2;
    const gap    = this.tines > 1 ? this.width / (this.tines - 1) : 0;
    const center = (this.tines - 1) / 2;
    return Array.from({ length: this.tines }, (_, t) => {
      const distFromCenter = Math.abs(t - center) / center || 0;
      return {
        // Base offset from stroke centre (perpendicular axis)
        baseOffset: -half + gap * t,
        // Outer hairs are lighter and thinner
        opacity: (this.opacity ?? 1) * (1 - distFromCenter * 0.55),
        width:   this.tineWidth * (1 - distFromCenter * 0.35),
        // Per-tine jitter seed — random but fixed for the whole stroke
        jitterPhase: Math.random() * Math.PI * 2,
      };
    });
  }

  onMouseDown(pointer) {
    this._beginStroke();
    this._points = [{ x: pointer.x, y: pointer.y }];
    // Generate per-tine profile once per stroke so it stays consistent
    this._tines = this._buildTineProfile();
  }

  onMouseMove(pointer) {
    if (!this._isDrawing) return;
    this._points.push({ x: pointer.x, y: pointer.y });
    this._render();
  }

  onMouseUp(options = {}) {
    if (!this._isDrawing) return;
    this._endStroke();
    const pointer = options.pointer;
    if (pointer) this._points.push({ x: pointer.x, y: pointer.y });
    this._finalize();
    this._points = [];
    this._tines  = [];
  }

  _tineOffset(tine, i) {
    const jitterAmp    = (this.width / (this.tines - 1)) * this.jitter;
    const jitterVal    = Math.sin(tine.jitterPhase + i * 0.8) * jitterAmp;
    return tine.baseOffset + jitterVal;
  }

  _render() {
    const ctx = this.canvas.contextTop;
    const pts = this._points;
    if (pts.length < 2) return;

    this.canvas.clearContext(ctx);
    ctx.save();
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    for (const tine of this._tines) {
      ctx.globalAlpha = tine.opacity;
      ctx.strokeStyle = this.color;
      ctx.lineWidth   = tine.width;

      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const curr   = pts[i];
        const next   = pts[i + 1] || curr;
        const offset = this._tineOffset(tine, i);
        const p      = perp(curr, next, offset);
        const x      = curr.x + p.x;
        const y      = curr.y + p.y;
        if (i === 0) ctx.moveTo(x, y);
        else {
          // Quadratic midpoint smoothing
          const prevPt   = pts[i - 1];
          const prevOff  = this._tineOffset(tine, i - 1);
          const prevPerp = perp(prevPt, curr, prevOff);
          const mx       = (prevPt.x + prevPerp.x + x) / 2;
          const my       = (prevPt.y + prevPerp.y + y) / 2;
          ctx.quadraticCurveTo(prevPt.x + prevPerp.x, prevPt.y + prevPerp.y, mx, my);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  _finalize() {
    if (this._points.length < 2) return;
    const paths = [];

    for (const tine of this._tines) {
      const tinePts = this._points.map((p, i) => {
        const next = this._points[i + 1] || p;
        const off  = perp(p, next, this._tineOffset(tine, i));
        return { x: p.x + off.x, y: p.y + off.y };
      });

      // Build quadratic path for each tine
      let d = `M ${tinePts[0].x} ${tinePts[0].y}`;
      for (let i = 1; i < tinePts.length - 1; i++) {
        const mx = (tinePts[i].x + tinePts[i + 1].x) / 2;
        const my = (tinePts[i].y + tinePts[i + 1].y) / 2;
        d += ` Q ${tinePts[i].x} ${tinePts[i].y} ${mx} ${my}`;
      }
      if (tinePts.length > 1) d += ` L ${tinePts[tinePts.length - 1].x} ${tinePts[tinePts.length - 1].y}`;

      paths.push(new Path(d, {
        strokeWidth:    tine.width,
        stroke:         this.color,
        fill:           'transparent',
        opacity:        tine.opacity,
        strokeLineCap:  'round',
        strokeLineJoin: 'round',
      }));
    }

    this.canvas.clearContext(this.canvas.contextTop);
    paths.forEach(p => this.canvas.add(p));
    // Fire once — undo/redo snapshots all objects added in this batch together
    if (paths.length > 0) this.canvas.fire('path:created', { path: paths[0] });
    this.canvas.renderAll();
  }
}
