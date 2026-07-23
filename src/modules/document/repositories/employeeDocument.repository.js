import prisma from "../../../config/prisma.js";

export class EmployeeDocumentRepository {
  static async create(data) {
    const { uploadedById, changeReason, ...docData } = data;

    return await prisma.employeeDocument.create({
      data: {
        companyId: docData.companyId,
        onboardingId: docData.onboardingId,
        candidateId: docData.candidateId,
        templateId: docData.templateId || null,
        documentType: docData.documentType,
        title: docData.title,
        status: docData.status || "UPLOADED",
        currentVersion: 1,
        fileUrl: docData.fileUrl,
        fileName: docData.fileName,
        mimeType: docData.mimeType,
        fileSize: docData.fileSize,
        storageKey: docData.storageKey,
        expiryDate: docData.expiryDate ? new Date(docData.expiryDate) : null,
        remarks: docData.remarks || null,
        versions: {
          create: {
            versionNumber: 1,
            fileUrl: docData.fileUrl,
            fileName: docData.fileName,
            mimeType: docData.mimeType,
            fileSize: docData.fileSize,
            storageKey: docData.storageKey,
            uploadedById,
            changeReason: changeReason || "Initial Document Upload"
          }
        },
        approvalHistories: {
          create: {
            performedById: uploadedById,
            toStatus: docData.status || "UPLOADED",
            remarks: "Initial Document Upload"
          }
        }
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        template: true,
        verifiedBy: { select: { id: true, name: true, email: true } },
        versions: {
          include: { uploadedBy: { select: { id: true, name: true } } },
          orderBy: { versionNumber: "desc" }
        }
      }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.employeeDocument.findFirst({
      where,
      include: {
        company: { select: { id: true, name: true } },
        candidate: { select: { id: true, name: true, email: true } },
        template: true,
        verifiedBy: { select: { id: true, name: true, email: true } },
        versions: {
          include: { uploadedBy: { select: { id: true, name: true } } },
          orderBy: { versionNumber: "desc" }
        },
        verifications: {
          include: { verifiedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        },
        approvalHistories: {
          include: { performedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async findByOnboardingId(onboardingId, companyId) {
    const where = { onboardingId, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.employeeDocument.findMany({
      where,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        template: true,
        verifiedBy: { select: { id: true, name: true } },
        versions: { select: { id: true, versionNumber: true, createdAt: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  static async updateMetadata(id, companyId, updateData) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    const dataToUpdate = { updatedAt: new Date() };
    if (updateData.title) dataToUpdate.title = updateData.title;
    if (updateData.remarks !== undefined) dataToUpdate.remarks = updateData.remarks;
    if (updateData.expiryDate !== undefined) {
      dataToUpdate.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : null;
    }

    return await prisma.employeeDocument.updateMany({
      where,
      data: dataToUpdate
    });
  }

  static async updateStatusAndRecordHistory(id, companyId, fromStatus, toStatus, verifiedById, remarks = null, action = "STATUS_UPDATE") {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    const doc = await prisma.employeeDocument.findFirst({ where });
    if (!doc) return null;

    return await prisma.$transaction([
      prisma.employeeDocument.update({
        where: { id },
        data: {
          status: toStatus,
          verifiedById,
          verifiedAt: new Date(),
          remarks: remarks || doc.remarks,
          updatedAt: new Date()
        }
      }),
      prisma.documentVerification.create({
        data: {
          documentId: id,
          versionNumber: doc.currentVersion,
          action,
          verifiedById,
          remarks
        }
      }),
      prisma.documentApprovalHistory.create({
        data: {
          documentId: id,
          performedById: verifiedById,
          fromStatus,
          toStatus,
          remarks
        }
      })
    ]);
  }

  static async createNextVersion(id, companyId, newVersionData) {
    const doc = await prisma.employeeDocument.findFirst({ where: { id, deletedAt: null } });
    if (!doc) return null;

    const nextVersionNumber = doc.currentVersion + 1;

    return await prisma.$transaction([
      prisma.documentVersion.create({
        data: {
          documentId: id,
          versionNumber: nextVersionNumber,
          fileUrl: newVersionData.fileUrl,
          fileName: newVersionData.fileName,
          mimeType: newVersionData.mimeType,
          fileSize: newVersionData.fileSize,
          storageKey: newVersionData.storageKey,
          uploadedById: newVersionData.uploadedById,
          changeReason: newVersionData.changeReason || `Re-uploaded version ${nextVersionNumber}`
        }
      }),
      prisma.employeeDocument.update({
        where: { id },
        data: {
          currentVersion: nextVersionNumber,
          fileUrl: newVersionData.fileUrl,
          fileName: newVersionData.fileName,
          mimeType: newVersionData.mimeType,
          fileSize: newVersionData.fileSize,
          storageKey: newVersionData.storageKey,
          status: "UPLOADED",
          remarks: newVersionData.changeReason || doc.remarks,
          updatedAt: new Date()
        }
      }),
      prisma.documentApprovalHistory.create({
        data: {
          documentId: id,
          performedById: newVersionData.uploadedById,
          fromStatus: doc.status,
          toStatus: "UPLOADED",
          remarks: `Re-uploaded version ${nextVersionNumber}`
        }
      })
    ]);
  }

  static async softDelete(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.employeeDocument.updateMany({
      where,
      data: { deletedAt: new Date() }
    });
  }
}
