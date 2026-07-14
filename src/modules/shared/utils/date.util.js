/**
 * Formats a given date into a standardized ISO string or returns null if invalid.
 * @param {Date|string|number} date 
 * @returns {string|null}
 */
export const toISOStringSafe = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/**
 * Checks if a given date is in the past.
 * @param {Date|string|number} date 
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < new Date().getTime();
};
