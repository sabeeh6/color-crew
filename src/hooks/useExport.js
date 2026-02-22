// src/hooks/useExport.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { selectSketchTitle } from '../store/slices/canvasSlice';
import { useSaveSketchMutation } from '../store/api/sketchApi';
import { setIsSaving, setLastSavedAt } from '../store/slices/canvasSlice';

export const useExport = () => {
  const dispatch = useDispatch();
  const sketchTitle = useSelector(selectSketchTitle);
  const [saveSketchMutation] = useSaveSketchMutation();

  // Export as high-resolution PNG download
  const exportPNG = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${sketchTitle}.png`;
    link.click();
  }, [sketchTitle]);

  // Export as PDF — 100% client-side with jsPDF, no backend needed
  const exportPDF = useCallback(() => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });

    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${sketchTitle}.pdf`);
  }, [sketchTitle]);

  // Save to backend via RTK Query mutation
  const saveToCloud = useCallback(async (sketchId = null) => {
    const canvas = getCanvasInstance();
    if (!canvas) return;

    dispatch(setIsSaving(true));

    try {
      // Serialize canvas to Fabric JSON
      const fabricJSON = canvas.toJSON(['id', 'name', 'customType']);

      // Generate small thumbnail for dashboard gallery
      const thumbnailBase64 = canvas.toDataURL({
        format: 'png',
        multiplier: 0.3, // low-res thumbnail
      });

      await saveSketchMutation({
        sketchId,
        title: sketchTitle,
        fabricJSON,
        thumbnailBase64,
      }).unwrap();

      dispatch(setLastSavedAt(new Date().toISOString()));
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      dispatch(setIsSaving(false));
    }
  }, [dispatch, saveSketchMutation, sketchTitle]);

  // Load a sketch from Fabric JSON
  const loadFromJSON = useCallback(async (json) => {
    const canvas = getCanvasInstance();
    if (!canvas) return;
    // v6: loadFromJSON is Promise-based
    await canvas.loadFromJSON(json);
    canvas.renderAll();
  }, []);

  return { exportPNG, exportPDF, saveToCloud, loadFromJSON };
};