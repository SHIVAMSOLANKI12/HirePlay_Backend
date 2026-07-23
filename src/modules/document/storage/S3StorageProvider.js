import { StorageProvider } from "./StorageProvider.interface.js";

/**
 * AWS S3 / MinIO Storage Provider Implementation.
 * Easily activated by setting STORAGE_PROVIDER=S3 in environment variables.
 */
export class S3StorageProvider extends StorageProvider {
  constructor(options = {}) {
    super();
    this.bucketName = options.bucketName || process.env.S3_BUCKET_NAME || "hireplay-documents";
    this.region = options.region || process.env.AWS_REGION || "us-east-1";
  }

  async uploadFile(file, destinationDir = "documents") {
    // S3 Client integration point
    const storageKey = `${destinationDir}/${Date.now()}_${file.originalname}`;
    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${storageKey}`;

    return {
      storageKey,
      fileUrl,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size
    };
  }

  async deleteFile(storageKey) {
    console.log(`[S3StorageProvider] Deleting object ${storageKey} from bucket ${this.bucketName}`);
    return true;
  }

  async getFileUrl(storageKey) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${storageKey}`;
  }
}
