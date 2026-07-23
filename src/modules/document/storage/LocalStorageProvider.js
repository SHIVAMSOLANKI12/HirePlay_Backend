import fs from "fs";
import path from "path";
import crypto from "crypto";
import { StorageProvider } from "./StorageProvider.interface.js";

export class LocalStorageProvider extends StorageProvider {
  constructor(baseUploadDir = "uploads") {
    super();
    this.baseUploadDir = baseUploadDir;
  }

  async uploadFile(file, destinationDir = "documents") {
    if (!file || !file.buffer) {
      throw new Error("Invalid file object provided for local storage upload.");
    }

    const targetFolder = path.join(process.cwd(), this.baseUploadDir, destinationDir);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Sanitize filename and append unique random hex string
    const ext = path.extname(file.originalname || "").toLowerCase();
    const cleanBaseName = path.basename(file.originalname || "document", ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    const fileName = `${cleanBaseName}_${uniqueSuffix}${ext}`;
    const filePath = path.join(targetFolder, fileName);

    // Save buffer to disk
    fs.writeFileSync(filePath, file.buffer);

    const relativePath = path.join(destinationDir, fileName).replace(/\\/g, "/");
    const storageKey = relativePath;
    const fileUrl = `/${this.baseUploadDir}/${relativePath}`;

    return {
      storageKey,
      fileUrl,
      fileName: file.originalname || fileName,
      mimeType: file.mimetype,
      fileSize: file.size
    };
  }

  async deleteFile(storageKey) {
    try {
      const filePath = path.join(process.cwd(), this.baseUploadDir, storageKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[LocalStorageProvider] Failed to delete file:", error);
      return false;
    }
  }

  async getFileUrl(storageKey) {
    const relativePath = storageKey.replace(/\\/g, "/");
    return `/${this.baseUploadDir}/${relativePath}`;
  }
}
