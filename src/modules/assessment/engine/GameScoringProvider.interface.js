/**
 * GameScoringProvider Interface
 * Responsible for evaluating the performance of the candidate.
 */
export class GameScoringProvider {
  /**
   * Calculates the final score for the game session.
   * @param {Object} seedData - The initial board/seed
   * @param {Array<Object>} moves - The recorded moves
   * @param {Object} sessionContext - Context containing timeTakenMs, cheatRiskScore, pauseCount, etc.
   * @param {Object} [scoringProfile] - Custom weights for scoring (e.g. { accuracy, efficiency, time, cheatPenalty })
   * @returns {Promise<{score: number, maxScore: number, accuracy: number, efficiency: number, decisionSpeed: number, metadata: Object}>}
   */
  async calculateScore(seedData, moves, sessionContext, scoringProfile) {
    throw new Error("calculateScore() must be implemented");
  }
}
