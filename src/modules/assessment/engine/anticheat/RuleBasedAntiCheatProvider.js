import { AntiCheatProvider } from "./AntiCheatProvider.interface.js";

export class RuleBasedAntiCheatProvider extends AntiCheatProvider {
  /**
   * Rule-based engine that evaluates cheat risk based on rigid events.
   */
  async evaluateEvent(session, event) {
    let scoreIncrement = 0;
    let flagSession = false;

    // Rules
    switch (event.eventType) {
      case "TAB_HIDDEN":
        scoreIncrement = 15;
        break;
      case "WINDOW_BLUR":
        scoreIncrement = 10;
        break;
      case "FULLSCREEN_EXIT":
        scoreIncrement = 25;
        break;
      case "NETWORK_DISCONNECT":
        scoreIncrement = 5;
        break;
      case "MULTIPLE_SESSIONS":
        scoreIncrement = 100; // Immediate flag
        flagSession = true;
        break;
      case "INVALID_MOVE_SPAM":
        scoreIncrement = 40;
        break;
      case "RAPID_CLICK_BURST":
        scoreIncrement = 20;
        break;
      default:
        scoreIncrement = 0;
    }

    const newScore = (session.cheatRiskScore || 0) + scoreIncrement;
    const riskLevel = this._calculateRiskLevel(newScore);

    if (newScore > 80) {
      flagSession = true;
    }

    return {
      scoreIncrement,
      newScore,
      riskLevel,
      flagSession
    };
  }

  _calculateRiskLevel(score) {
    if (score <= 20) return "LOW";
    if (score <= 50) return "MEDIUM";
    if (score <= 80) return "HIGH";
    return "CRITICAL";
  }
}
