import { LocalStorageProvider } from "./LocalStorageProvider.js";
import { S3StorageProvider } from "./S3StorageProvider.js";

export class StorageProviderFactory {
  static getProvider(type = process.env.STORAGE_PROVIDER || "LOCAL") {
    const providerType = String(type).toUpperCase();

    switch (providerType) {
      case "S3":
      case "MINIO":
      case "AWS":
        return new S3StorageProvider();
      case "LOCAL":
      default:
        return new LocalStorageProvider();
    }
  }
}
