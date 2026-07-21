import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import { ResumeParser } from "./ResumeParser.interface.js";
import AppError from "../../../../utils/AppError.js";

export class PdfResumeParser extends ResumeParser {
  async parse(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    } catch (error) {
      console.error("[PdfResumeParser] Detailed Error:", error);
      throw new AppError("Failed to parse PDF file. The file might be corrupted or encrypted.", 422);
    }
  }
}
