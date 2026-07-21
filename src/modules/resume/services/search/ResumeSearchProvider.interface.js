export class ResumeSearchProvider {
  /**
   * Search resumes belonging to a specific company
   * @param {string} companyId - The ID of the company
   * @param {Object} queryOptions - The search query and filters
   * @returns {Promise<{total: number, data: Array, page: number, limit: number}>}
   */
  async search(companyId, queryOptions) {
    throw new Error("Method 'search()' must be implemented.");
  }

  /**
   * Get search suggestions for a specific field
   * @param {string} companyId - The ID of the company
   * @param {string} field - The field to get suggestions for (e.g., 'skills')
   * @returns {Promise<string[]>}
   */
  async getSuggestions(companyId, field) {
    throw new Error("Method 'getSuggestions()' must be implemented.");
  }
}
