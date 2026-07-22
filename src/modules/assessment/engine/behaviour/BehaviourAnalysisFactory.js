import { RuleBasedBehaviourProvider } from "./RuleBasedBehaviourProvider.js";

export class BehaviourAnalysisFactory {
  /**
   * Resolves the concrete BehaviourAnalysisProvider instance.
   * Defaults to RuleBasedBehaviourProvider.
   * 
   * @param {string} [providerType="RULE_BASED"]
   * @returns {import("./BehaviourAnalysisProvider.interface.js").BehaviourAnalysisProvider}
   */
  static getProvider(providerType = "RULE_BASED") {
    switch (providerType.toUpperCase()) {
      case "RULE_BASED":
      default:
        return new RuleBasedBehaviourProvider();
    }
  }
}
