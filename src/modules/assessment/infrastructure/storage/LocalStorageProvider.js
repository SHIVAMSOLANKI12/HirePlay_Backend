import { StorageProvider } from "./StorageProvider.interface.js";
import path from "path";
import fs from "fs/promises";

export class LocalStorageProvider extends StorageProvider {
  constructor(baseDir = "./uploads") {
    super();
    this.baseDir = path.resolve(baseDir);
  }

  async upload(content, destinationPath) {
    const fullPath = path.join(this.baseDir, destinationPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    return {
      fileId: destinationPath,
      url: `/uploads/${destinationPath.replace(/\\/g, "/")}`
    };
  }

  async getUrl(fileId) {
    return `/uploads/${fileId.replace(/\\/g, "/")}`;
  }
}
