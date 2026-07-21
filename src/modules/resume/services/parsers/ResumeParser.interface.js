export class ResumeParser {
  /**
   * Parse the given file and return extracted raw text.
   * @param {string} filePath - Absolute path to the file.
   * @returns {Promise<string>} The extracted raw text.
   */
  async parse(filePath) {
    throw new Error("Method 'parse' must be implemented by subclasses");
  }
}
