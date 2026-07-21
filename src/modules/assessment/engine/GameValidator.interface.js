/**
 * GameValidator Interface
 * Responsible for verifying if a sequence of moves made by the candidate is legal.
 */
export class GameValidator {
  /**
   * Validates a candidate's move sequence against the game state.
   * @param {Object} seedData - The initial board/seed
   * @param {Array<Object>} moves - The recorded moves
   * @returns {Promise<boolean>} True if all moves are mathematically and logically legal
   */
  async validateMoves(seedData, moves) {
    throw new Error("validateMoves() must be implemented");
  }
}
