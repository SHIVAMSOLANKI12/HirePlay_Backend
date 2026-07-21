/**
 * GameScoringProvider Interface
 * Responsible for evaluating the performance of the candidate.
 */
export class GameScoringProvider {
  /**
   * Calculates the final score for the game session.
   * @param {Object} seedData - The initial board/seed
   * @param {Array<Object>} moves - The recorded moves
   * @param {number} timeTakenMs - Time taken in milliseconds
   * @returns {Promise<{score: number, maxScore: number, metadata: Object}>}
   */
  async calculateScore(seedData, moves, timeTakenMs) {
    throw new Error("calculateScore() must be implemented");
  }
}
