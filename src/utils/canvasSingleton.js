let _canvas = null;

export const setCanvasInstance = (canvas) => {
  _canvas = canvas;
};

export const getCanvasInstance = () => _canvas;

export const destroyCanvasInstance = () => {
  if (_canvas) {
    _canvas.dispose();
    _canvas = null;
  }
};