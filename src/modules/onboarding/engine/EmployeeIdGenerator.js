import prisma from "../../../config/prisma.js";

export class EmployeeIdGenerator {
  /**
   * Generates a unique employee ID for a company.
   * Format: {Prefix}-{Year}-{SequenceNumber} (e.g. HP-2026-000001)
   * @param {string} companyId 
   * @param {Object} options 
   * @param {string} options.prefix Configurable prefix (default: "HP")
   * @param {number} options.year Year override (default: current year)
   * @returns {Promise<string>} Generated unique employee number
   */
  static async generateEmployeeId(companyId, options = {}) {
    const prefix = options.prefix || "HP";
    const year = options.year || new Date().getFullYear();

    // Find latest employee profile count for this company to increment sequence
    const existingCount = await prisma.employeeProfile.count({
      where: { companyId }
    });

    let sequence = existingCount + 1;
    let employeeNumber = `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;

    // Ensure uniqueness by checking existing employee profile with this number
    let exists = await prisma.employeeProfile.findFirst({
      where: { companyId, employeeNumber }
    });

    while (exists) {
      sequence += 1;
      employeeNumber = `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
      exists = await prisma.employeeProfile.findFirst({
        where: { companyId, employeeNumber }
      });
    }

    return employeeNumber;
  }
}
