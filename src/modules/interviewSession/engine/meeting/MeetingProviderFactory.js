import { InternalMeetingProvider } from "./InternalMeetingProvider.js";

export class MeetingProviderFactory {
  static getProvider(providerType = "INTERNAL") {
    switch (providerType) {
      case "INTERNAL":
      default:
        return new InternalMeetingProvider();
    }
  }
}
