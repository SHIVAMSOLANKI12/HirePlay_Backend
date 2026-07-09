/**
 * Cloudinary Storage Provider Placeholder
 * Implements the standard storage interface for Cloudinary.
 */
class CloudinaryStorage {
  /**
   * Upload file to Cloudinary
   * @param {Object} file - The file object
   * @returns {Promise<string>} The stored Cloudinary URL
   */
  async upload(file) {
    throw new Error("Cloudinary upload is not implemented yet.");
  }

  /**
   * Delete file from Cloudinary
   * @param {string} filePath - The Cloudinary public ID or URL
   * @returns {Promise<boolean>}
   */
  async delete(filePath) {
    throw new Error("Cloudinary delete is not implemented yet.");
  }

  /**
   * Get public URL for Cloudinary file
   * @param {string} filePath - The Cloudinary public ID or URL
   * @returns {string}
   */
  getPublicUrl(filePath) {
    throw new Error("Cloudinary getPublicUrl is not implemented yet.");
  }
}

export default new CloudinaryStorage();
