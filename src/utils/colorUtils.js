export const hexToRgba = (hex, alpha) => {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
     return hex; 
  }

  let cleanedHex = hex.replace('#', '');

  if (cleanedHex.length === 3) {
    cleanedHex = cleanedHex.split('').map(char => char + char).join('');
  }

  if (cleanedHex.length === 8) {
    cleanedHex = cleanedHex.substring(0, 6);
  }

  const r = parseInt(cleanedHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanedHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanedHex.substring(4, 6), 16) || 0;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
