/**
 * Interface for AI Providers (Provider / Strategy Pattern).
 * Decouples AI engine from specific LLM vendors (OpenAI, Gemini, Claude, RuleBased).
 */
export class AIProvider {
  /**
   * Generates AI Analysis from session scorecards and metadata.
   * @param {Object} sessionData 
   * @param {Array<Object>} scorecards 
   * @param {Object} metadata 
   * @returns {Promise<{
   *   overallRecommendation: string,
   *   confidenceScore: number,
   *   confidenceReason: string,
   *   summary: Object,
   *   insights: Object,
   *   risks: Array<Object>,
   *   recommendations: Array<Object>
   * }>}
   */
  async analyzeInterview(sessionData, scorecards, metadata = {}) {
    throw new Error("Method analyzeInterview() must be implemented.");
  }
}
