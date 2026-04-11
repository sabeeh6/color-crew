// src/hooks/useExport.js
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { getCanvasInstance } from '../utils/canvasSingleton';
import { selectSketchTitle } from '../store/slices/canvasSlice';
import { useSaveSketchMutation } from '../store/api/sketchApi';
import { setIsSaving, setLastSavedAt } from '../store/slices/canvasSlice';

export const useExport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

      const response = await saveSketchMutation({
        sketchId,
        title: sketchTitle,
        fabricJSON,
        thumbnailBase64,
      }).unwrap();
      
      console.log('🟢 API Response: Sketch saved successfully!', response);
      toast.success('Sketch saved perfectly to your cloud!');

      dispatch(setLastSavedAt(new Date().toISOString()));
      
      // If it was a NEW sketch (no ID), update URL to newly created ID
      // This allows 'Update' mode without leaving the page
      if (!sketchId && response?._id) {
        navigate(`/drawing/${response._id}`, { replace: true });
      }
    } catch (err) {
      console.error('🔴 Save failed API Error:', err);
      toast.error(err?.data?.message || 'Failed to save sketch to cloud Server Error!');
    } finally {
      dispatch(setIsSaving(false));
    }
  }, [dispatch, saveSketchMutation, sketchTitle]);

  // Load a sketch from Fabric JSON
  const loadFromJSON = useCallback(async (json) => {
    console.log("🔍 [useExport] loadFromJSON called with:", typeof json, json ? "Has Data" : "Empty");
    const canvas = getCanvasInstance();
    console.log("🔍 [useExport] Canvas Instance is:", canvas ? "Present" : "NULL");
    if (!canvas) {
      console.warn("⚠️ Canvas instance was null inside loadFromJSON!");
      return;
    }
    // v6: loadFromJSON is Promise-based
    console.log("🔍 [useExport] Awaiting canvas.loadFromJSON...");
    await canvas.loadFromJSON(json);
    console.log("🔍 [useExport] loadFromJSON finished. Calling renderAll()..");
    canvas.renderAll();
  }, []);

  return { exportPNG, exportPDF, saveToCloud, loadFromJSON };
};