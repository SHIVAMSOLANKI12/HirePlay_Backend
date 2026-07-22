/**
 * Interface / Base Class for File & Asset Storage Providers.
 * Ready for S3, Azure Blob, Google Cloud Storage, Cloudflare R2, or Local filesystem.
 */
export class StorageProvider {
  /**
   * Uploads a file/buffer to storage.
   * @param {Buffer|string} content
   * @param {string} destinationPath
   * @returns {Promise<{ fileId: string, url: string }>}
   */
  async upload(content, destinationPath) {
    throw new Error("upload() must be implemented by concrete storage provider");
  }

  /**
   * Resolves the accessible URL for a stored file.
   * @param {string} fileId
   * @returns {Promise<string>}
   */
  async getUrl(fileId) {
    throw new Error("getUrl() must be implemented by concrete storage provider");
  }
}
