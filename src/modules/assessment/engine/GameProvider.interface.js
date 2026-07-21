/**
 * GameProvider Interface
 * Base facade that orchestrates GameGenerator, GameValidator, and GameScoringProvider.
 * All specific Logic Games must implement this or compose the specific sub-providers.
 */
export class GameProvider {
  /**
   * Identifies the type of game (e.g., "LOGIC_CIRCUIT")
   */
  getGameType() {
    throw new Error("getGameType() must be implemented");
  }

  /**
   * Returns the GameGenerator for this game.
   * @returns {import('./GameGenerator.interface.js').GameGenerator}
   */
  getGenerator() {
    throw new Error("getGenerator() must be implemented");
  }

  /**
   * Returns the GameValidator for this game.
   * @returns {import('./GameValidator.interface.js').GameValidator}
   */
  getValidator() {
    throw new Error("getValidator() must be implemented");
  }

  /**
   * Returns the GameScoringProvider for this game.
   * @returns {import('./GameScoringProvider.interface.js').GameScoringProvider}
   */
  getScoringProvider() {
    throw new Error("getScoringProvider() must be implemented");
  }

}
