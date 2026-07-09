/**
 * Convert string to URL-friendly slug
 * @param {string} name - The string to convert
 * @returns {string} The generated slug
 */
export const generateSlug = (name) => {
  if (!name) return "";
  
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/**
 * Ensure slug is unique by checking against a repository or check function
 * @param {Object|Function} repositoryOrCheckFn - The repository object with a findBySlug method, or a direct check function
 * @param {string} name - The original name to generate a unique slug for
 * @returns {Promise<string>} The unique slug
 */
export const generateUniqueSlug = async (repositoryOrCheckFn, name) => {
  const baseSlug = generateSlug(name);

  let slug = baseSlug;
  let counter = 1;

  // If a function is passed directly, use it. Otherwise, assume it's a repository object with findBySlug.
  const checkExists =
    typeof repositoryOrCheckFn === "function"
      ? repositoryOrCheckFn
      : (s) => repositoryOrCheckFn.findBySlug(s);

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
