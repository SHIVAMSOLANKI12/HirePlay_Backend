/**
 * AntiCheatProvider Interface
 * Defines the contract for all anti-cheat implementations.
 */
export class AntiCheatProvider {
  /**
   * Analyzes an incoming move or cheat event to update the session's risk score.
   * @param {Object} session - The current game session
   * @param {Object} event - The move or cheat event
   * @returns {Promise<{ scoreIncrement: number, riskLevel: string, flagSession: boolean }>}
   */
  async evaluateEvent(session, event) {
    throw new Error("evaluateEvent() must be implemented");
  }
}
