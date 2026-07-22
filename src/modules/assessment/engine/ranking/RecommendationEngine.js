export class RecommendationEngine {
  /**
   * Evaluates the final score and assigns a recommendation level.
   * 
   * @param {number} finalScore - The final calculated score (0-100)
   * @returns {string} The RecommendationLevel Enum value
   */
  static evaluate(finalScore) {
    if (finalScore >= 95) return "OUTSTANDING";
    if (finalScore >= 85) return "HIGHLY_RECOMMENDED";
    if (finalScore >= 70) return "RECOMMENDED";
    if (finalScore >= 50) return "AVERAGE";
    return "NOT_RECOMMENDED";
  }
}
