import prisma from "../../../config/prisma.js";

export class DocumentTemplateRepository {
  static async create(data) {
    return await prisma.documentTemplate.create({
      data: {
        companyId: data.companyId,
        documentType: data.documentType,
        title: data.title,
        description: data.description || null,
        isRequired: data.isRequired !== undefined ? data.isRequired : true,
        allowedMimeTypes: data.allowedMimeTypes || ["application/pdf", "image/jpeg", "image/png"],
        maxFileSizeMb: Number(data.maxFileSizeMb) || 5.0,
        requiresExpiry: Boolean(data.requiresExpiry)
      }
    });
  }

  static async findByCompanyId(companyId) {
    return await prisma.documentTemplate.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "asc" }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.documentTemplate.findFirst({ where });
  }

  static async findByType(companyId, documentType) {
    return await prisma.documentTemplate.findFirst({
      where: { companyId, documentType, deletedAt: null }
    });
  }
}
