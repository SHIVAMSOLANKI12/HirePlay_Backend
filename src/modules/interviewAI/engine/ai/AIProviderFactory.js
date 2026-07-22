import { RuleBasedProvider } from "./RuleBasedProvider.js";

export class AIProviderFactory {
  static getProvider(providerType = "RULE_BASED") {
    switch (providerType) {
      case "RULE_BASED":
      default:
        return new RuleBasedProvider();
    }
  }
}
