export class StorageProvider {
  /**
   * Upload a file
   * @param {Object} file - The file object (usually from multer)
   * @param {string} destination - The target directory/prefix
   * @returns {Promise<{ key: string, url: string, size: number, mimeType: string, originalName: string, fileName: string }>}
   */
  async uploadFile(file, destination) {
    throw new Error("Method not implemented.");
  }

  /**
   * Delete a file
   * @param {string} key - The file storage key
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    throw new Error("Method not implemented.");
  }
}
