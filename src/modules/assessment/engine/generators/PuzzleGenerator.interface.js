/**
 * PuzzleGenerator Interface
 * Defines the contract for all procedural puzzle generators.
 */
export class PuzzleGenerator {
  /**
   * Generates a new puzzle based on input parameters.
   * @param {string} difficulty - e.g., 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
   * @param {string} gameType - e.g., 'LOGIC_CIRCUIT'
   * @param {string} candidateId - The ID of the candidate taking the assessment
   * @param {string} assessmentId - The ID of the assessment
   * @param {Object} config - Extra configurations for the generator
   * @returns {Promise<Object>} The generated puzzle containing { seedData, hiddenSolution, hash, version, metadata }
   */
  async generate(difficulty, gameType, candidateId, assessmentId, config = {}) {
    throw new Error("generate() must be implemented by the specific PuzzleGenerator");
  }
}
