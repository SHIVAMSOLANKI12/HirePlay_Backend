import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "./storage.provider.js";

export class LocalStorageProvider extends StorageProvider {
  /**
   * Upload a file to local storage
   * @param {Object} file - The file object from multer
   * @param {string} destination - The target directory
   * @returns {Promise<{ key: string, url: string, size: number, mimeType: string, originalName: string, fileName: string }>}
   */
  async uploadFile(file, destination) {
    // Ensure the destination directory exists
    await fs.mkdir(destination, { recursive: true });

    // The file is already saved by multer, we just need to return the metadata
    // In a real cloud provider, this is where we'd upload the buffer to S3/Cloudinary
    // But since multer saves it to disk in our middleware, we just format the response
    
    // Convert absolute path to a relative URL path (e.g. "uploads/resumes/filename.pdf")
    const relativePath = path.relative(process.cwd(), file.path);
    // Replace windows backslashes with forward slashes for URLs
    const normalizedUrl = `/${relativePath.replace(/\\/g, "/")}`;

    return {
      key: file.filename, // Use filename as the unique key
      url: normalizedUrl,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
      fileName: file.filename,
    };
  }

  /**
   * Delete a file from local storage
   * @param {string} key - The file storage key (filename)
   * @param {string} destination - The directory where the file is stored
   * @returns {Promise<void>}
   */
  async deleteFile(key, destination) {
    try {
      const filePath = path.join(destination, key);
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      // If file doesn't exist, we can ignore it
    }
  }
}
