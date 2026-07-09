/**
 * Generic Storage Service Abstraction
 * Acts as a wrapper around the active storage provider (Disk, S3, Cloudinary).
 * Exposes a unified interface for all modules.
 */
class StorageService {
  /**
   * @param {Object} provider - The active storage provider implementation
   */
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Upload a file using the active provider
   * @param {Object} file - File object to upload
   * @returns {Promise<string>} Uploaded file URL or path
   */
  async upload(file) {
    if (!this.provider || typeof this.provider.upload !== "function") {
      throw new Error("Storage provider is not properly configured for upload.");
    }
    return this.provider.upload(file);
  }

  /**
   * Delete a file using the active provider
   * @param {string} filePath - Path or URL of the file to delete
   * @returns {Promise<boolean>}
   */
  async delete(filePath) {
    if (!this.provider || typeof this.provider.delete !== "function") {
      throw new Error("Storage provider is not properly configured for delete.");
    }
    return this.provider.delete(filePath);
  }
  /**
   * Get the public URL for a stored file
   * @param {string} filePath - Path or identifier of the file
   * @returns {string} Publicly accessible URL
   */
  getPublicUrl(filePath) {
    if (!this.provider || typeof this.provider.getPublicUrl !== "function") {
      throw new Error("Storage provider is not properly configured for getPublicUrl.");
    }
    return this.provider.getPublicUrl(filePath);
  }
}

export default StorageService;
