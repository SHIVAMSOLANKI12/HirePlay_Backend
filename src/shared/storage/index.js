import StorageService from "./storage.service.js";
import diskStorage from "./disk.storage.js";
import s3Storage from "./s3.storage.js";
import cloudinaryStorage from "./cloudinary.storage.js";

/**
 * Storage Provider Configuration
 * Selects the active storage provider based on environment variables.
 * Allows easy switching between Disk, S3, and Cloudinary.
 */
const getActiveProvider = () => {
  const provider = process.env.STORAGE_PROVIDER;

  switch (provider) {
    case "s3":
      return s3Storage;
    case "cloudinary":
      return cloudinaryStorage;
    case "disk":
    default:
      // Default to local disk storage if nothing is specified
      return diskStorage;
  }
};

// Initialize the generic storage service with the selected provider
const storageService = new StorageService(getActiveProvider());

export default storageService;
