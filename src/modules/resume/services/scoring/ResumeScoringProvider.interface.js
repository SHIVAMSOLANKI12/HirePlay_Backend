export class ResumeScoringProvider {
  /**
   * Score a parsed resume.
   * @param {Object} parsedData - The extracted JSON data from the resume.
   * @param {Object} [jobCriteria] - Optional job specific requirements to score against.
   * @returns {Promise<{score: number, breakdown: Object, version: string, providerName: string}>}
   */
  async score(parsedData, jobCriteria = null) {
    throw new Error("Method 'score()' must be implemented.");
  }
}
