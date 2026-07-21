/**
 * GameGenerator Interface
 * Responsible for generating a new game board, seed, or puzzle based on difficulty.
 */
export class GameGenerator {
  /**
   * Generates game initialization data.
   * @param {string} difficulty - GameDifficulty enum (BEGINNER, INTERMEDIATE, etc.)
   * @param {Object} config - Optional custom configurations
   * @returns {Promise<Object>} Seed data / Board state
   */
  async generate(difficulty, config = {}) {
    throw new Error("generate() must be implemented");
  }
}
