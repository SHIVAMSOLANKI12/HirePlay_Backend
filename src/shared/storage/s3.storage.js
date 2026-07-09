/**
 * AWS S3 Storage Provider Placeholder
 * Implements the standard storage interface for AWS S3.
 */
class S3Storage {
  /**
   * Upload file to AWS S3
   * @param {Object} file - The file object
   * @returns {Promise<string>} The stored S3 URL
   */
  async upload(file) {
    throw new Error("AWS S3 upload is not implemented yet.");
  }

  /**
   * Delete file from AWS S3
   * @param {string} filePath - The S3 object key or URL
   * @returns {Promise<boolean>}
   */
  async delete(filePath) {
    throw new Error("AWS S3 delete is not implemented yet.");
  }

  /**
   * Get public URL for AWS S3 file
   * @param {string} filePath - The S3 object key or URL
   * @returns {string}
   */
  getPublicUrl(filePath) {
    throw new Error("AWS S3 getPublicUrl is not implemented yet.");
  }
}

export default new S3Storage();
