// ─── Tool IDs ──────────────────────────────────────────────────────────────
export const TOOLS = {
  SELECT:       'select',
  PENCIL:       'pencil',
  SPRAY:        'spray',
  CIRCLE_BRUSH: 'circle-brush',
  ERASER:       'eraser',
  RECT:         'rect',
  CIRCLE:       'circle',
  TRIANGLE:     'triangle',
  LINE:         'line',
  TEXT:         'text',
};

// ─── Default Tool Settings ─────────────────────────────────────────────────
export const DEFAULT_STROKE_COLOR  = '#1a1a1a';
export const DEFAULT_FILL_COLOR    = 'transparent';
export const DEFAULT_STROKE_WIDTH  = 3;
export const DEFAULT_OPACITY       = 1;
export const DEFAULT_BRUSH_DENSITY = 30;
export const DEFAULT_FONT_SIZE     = 20;
export const DEFAULT_FONT_FAMILY   = 'Arial';
export const CANVAS_BG_COLOR       = '#ffffff';

// ─── History Stack Limit ───────────────────────────────────────────────────
export const HISTORY_LIMIT = 50;

// ─── Zoom Constraints ──────────────────────────────────────────────────────
export const ZOOM_MIN  = 0.1;   // 10%
export const ZOOM_MAX  = 10;    // 1000%
export const ZOOM_STEP = 1.2;   // 20% per click

// ─── Auto-save Interval ────────────────────────────────────────────────────
export const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds

// ─── Canvas Thumbnail Quality ──────────────────────────────────────────────
export const THUMBNAIL_MULTIPLIER = 0.3;  // 30% of canvas size
export const EXPORT_MULTIPLIER    = 2;    // 2x for crisp PNG/PDF
