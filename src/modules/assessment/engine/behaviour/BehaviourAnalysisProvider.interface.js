/**
 * Interface / Base Class for Behaviour Analysis Providers.
 * Supports rule-based, custom ML, OpenAI, Gemini, etc.
 */
export class BehaviourAnalysisProvider {
  /**
   * Analyzes candidate gameplay and calculates behavioural profile metrics & recruiter insights.
   * 
   * @param {Object} inputData
   * @param {Array<Object>} inputData.moves - Recorded game moves
   * @param {Object} inputData.sessionContext - Timing, cheat events, pause count, idle time
   * @param {Object} inputData.scoreResult - Score, accuracy, efficiency from scoring engine
   * @param {Object} inputData.seedData - Puzzle seed & metadata
   * @returns {Promise<{
   *   thinkingSpeed: number,
   *   decisionQuality: number,
   *   problemSolving: number,
   *   planningAbility: number,
   *   consistency: number,
   *   riskTaking: number,
   *   accuracy: number,
   *   learningPattern: number,
   *   stressIndicator: number,
   *   confidenceIndicator: number,
   *   behaviourSummary: Array<string>,
   *   metrics: Object
   * }>}
   */
  async analyze(inputData) {
    throw new Error("analyze() must be implemented by concrete provider");
  }
}
