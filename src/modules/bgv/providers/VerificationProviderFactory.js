import { ManualVerificationProvider } from "./ManualVerificationProvider.js";
import { AuthBridgeProvider } from "./AuthBridgeProvider.js";
import { IDfyProvider } from "./IDfyProvider.js";

export class VerificationProviderFactory {
  static getProvider(type = process.env.BGV_PROVIDER || "MANUAL") {
    const providerType = String(type).toUpperCase();

    switch (providerType) {
      case "AUTHBRIDGE":
        return new AuthBridgeProvider();
      case "IDFY":
        return new IDfyProvider();
      case "MANUAL":
      default:
        return new ManualVerificationProvider();
    }
  }
}
