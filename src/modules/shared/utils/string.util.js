/**
 * Converts a string into a URL-friendly slug.
 * @param {string} text 
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} text 
 * @returns {string}
 */
export const capitalize = (text) => {
  if (!text || typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};
