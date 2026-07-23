export class StorageProvider {
  /**
   * Uploads a file buffer or stream to the storage provider.
   * @param {Object} file { buffer, originalname, mimetype, size }
   * @param {string} destinationDir Subdirectory or bucket path
   * @returns {Promise<{ storageKey: string, fileUrl: string, fileName: string, mimeType: string, fileSize: number }>}
   */
  async uploadFile(file, destinationDir = "documents") {
    throw new Error("StorageProvider.uploadFile() must be implemented by concrete provider.");
  }

  /**
   * Deletes a file by storage key.
   * @param {string} storageKey 
   * @returns {Promise<boolean>}
   */
  async deleteFile(storageKey) {
    throw new Error("StorageProvider.deleteFile() must be implemented by concrete provider.");
  }

  /**
   * Generates public or signed URL for preview/download.
   * @param {string} storageKey 
   * @returns {Promise<string>}
   */
  async getFileUrl(storageKey) {
    throw new Error("StorageProvider.getFileUrl() must be implemented by concrete provider.");
  }
}
