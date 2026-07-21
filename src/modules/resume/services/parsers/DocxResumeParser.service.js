import fs from "fs/promises";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const mammoth = require("mammoth");
import { ResumeParser } from "./ResumeParser.interface.js";
import AppError from "../../../../utils/AppError.js";

export class DocxResumeParser extends ResumeParser {
  async parse(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new AppError("Failed to parse DOCX file. The file might be corrupted.", 422);
    }
  }
}
