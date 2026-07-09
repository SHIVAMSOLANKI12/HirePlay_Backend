import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Local Disk Storage Provider
 * Implements the standard storage interface for local file system.
 */
class DiskStorage {
  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");
    this.ensureDirectory();
  }

  /**
   * Ensure the upload directory exists
   */
  async ensureDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save file to local disk
   * @param {Object} file - The file object (e.g. from multer)
   * @returns {Promise<string>} The stored file path or URL
   */
  async upload(file) {
    if (!file || !file.buffer) {
      throw new Error("Invalid file object provided for disk storage.");
    }

    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const extension = path.extname(file.originalname || "");
    const fileName = `${uniqueSuffix}${extension}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return `/uploads/${fileName}`;
  }

  /**
   * Delete file from local disk
   * @param {string} filePath - The path/URL of the file to delete
   * @returns {Promise<boolean>}
   */
  async delete(filePath) {
    try {
      // Extract filename from the URL/path
      const fileName = path.basename(filePath);
      const fullPath = path.join(this.uploadDir, fileName);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      // Return false if file doesn't exist or cannot be deleted
      return false;
    }
  }

  /**
   * Get the public URL for a local stored file
   * @param {string} filePath - The path to convert
   * @returns {string} Publicly accessible URL
   */
  getPublicUrl(filePath) {
    const baseUrl = process.env.APP_URL || "http://localhost:8000";
    // Ensure we don't duplicate slashes
    const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
    return `${baseUrl}${normalizedPath}`;
  }
}

export default new DiskStorage();
