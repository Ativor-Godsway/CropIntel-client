/**
 * Format a pesewas (smallest GHS unit) amount as GHS currency string.
 * e.g. 8500 → "₵85.00"
 */
export const formatCurrency = (pesewas) => {
  if (pesewas === null || pesewas === undefined) return '₵0.00';
  const ghs = pesewas / 100;
  return `₵${ghs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Parse a GHS string back to pesewas integer.
 * e.g. "85.00" → 8500
 */
export const parseToPesewas = (ghsString) => {
  const num = parseFloat(ghsString);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};
