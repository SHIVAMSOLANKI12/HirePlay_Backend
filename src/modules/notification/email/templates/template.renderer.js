/**
 * Replaces variables in a template string safely.
 * Expects variables in the format {{VariableName}}
 * 
 * @param {string} template - The HTML or Text template string
 * @param {Object} variables - Key-value pairs to replace
 * @returns {string} - The rendered string
 */
export const renderTemplate = (template, variables = {}) => {
  if (!template) return "";
  
  let rendered = template;
  
  for (const [key, value] of Object.entries(variables)) {
    // We use a global regex to replace all occurrences of {{key}}
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    
    // Basic sanitization to prevent breaking HTML (very simple for now)
    const safeValue = value ? String(value).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
    
    rendered = rendered.replace(regex, safeValue);
  }
  
  return rendered;
};
