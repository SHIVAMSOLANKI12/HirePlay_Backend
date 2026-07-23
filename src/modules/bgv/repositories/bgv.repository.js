import prisma from "../../../config/prisma.js";

export class BackgroundVerificationRepository {
  static async create(data) {
    const { defaultChecks, ...caseData } = data;

    return await prisma.backgroundVerification.create({
      data: {
        companyId: caseData.companyId,
        onboardingId: caseData.onboardingId,
        candidateId: caseData.candidateId,
        assignedHrId: caseData.assignedHrId || null,
        status: caseData.status || "NOT_STARTED",
        remarks: caseData.remarks || null,
        checks: defaultChecks && defaultChecks.length > 0 ? {
          create: defaultChecks.map(check => ({
            type: check.type || "CUSTOM",
            title: check.title,
            status: "NOT_STARTED",
            providerName: check.providerName || "MANUAL"
          }))
        } : undefined,
        history: {
          create: {
            performedById: caseData.createdById,
            fromStatus: null,
            toStatus: caseData.status || "NOT_STARTED",
            action: "INITIALIZE",
            remarks: "Initialized Background Verification Case"
          }
        }
      },
      include: {
        company: { select: { id: true, name: true } },
        candidate: { select: { id: true, name: true, email: true } },
        assignedHr: { select: { id: true, name: true, email: true } },
        checks: true,
        history: {
          include: { performedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        },
        attachments: true
      }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.backgroundVerification.findFirst({
      where,
      include: {
        company: { select: { id: true, name: true } },
        onboarding: { select: { id: true, currentStage: true, progressPercentage: true } },
        candidate: { select: { id: true, name: true, email: true } },
        assignedHr: { select: { id: true, name: true, email: true } },
        checks: {
          include: { verifiedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" }
        },
        history: {
          include: { performedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        },
        attachments: {
          include: { uploadedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async findByOnboardingId(onboardingId, companyId) {
    const where = { onboardingId, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.backgroundVerification.findFirst({
      where,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        assignedHr: { select: { id: true, name: true } },
        checks: true,
        history: {
          include: { performedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.candidateId) where.candidateId = filters.candidateId;
    if (filters.assignedHrId) where.assignedHrId = filters.assignedHrId;

    const [total, data] = await Promise.all([
      prisma.backgroundVerification.count({ where }),
      prisma.backgroundVerification.findMany({
        where,
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          assignedHr: { select: { id: true, name: true } },
          checks: { select: { id: true, type: true, status: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async updateStatusAndAddHistory(id, companyId, fromStatus, toStatus, action, performedById, remarks = null, overallResult = null) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    const updateData = {
      status: toStatus,
      updatedAt: new Date()
    };
    if (remarks) updateData.remarks = remarks;
    if (overallResult) updateData.overallResult = overallResult;
    if (toStatus === "IN_PROGRESS" && !updateData.startedAt) updateData.startedAt = new Date();
    if ((toStatus === "VERIFIED" || toStatus === "FAILED" || toStatus === "REJECTED") && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    return await prisma.$transaction([
      prisma.backgroundVerification.update({
        where: { id },
        data: updateData
      }),
      prisma.verificationHistory.create({
        data: {
          verificationId: id,
          performedById,
          fromStatus,
          toStatus,
          action,
          remarks
        }
      })
    ]);
  }

  static async updateCheckStatus(checkId, status, verifiedById, remarks = null, resultData = null) {
    return await prisma.verificationCheck.update({
      where: { id: checkId },
      data: {
        status,
        verifiedById,
        verifiedAt: new Date(),
        remarks: remarks || undefined,
        resultData: resultData || undefined,
        updatedAt: new Date()
      }
    });
  }

  static async updateAssignedHr(id, companyId, assignedHrId) {
    return await prisma.backgroundVerification.update({
      where: { id },
      data: { assignedHrId, updatedAt: new Date() }
    });
  }

  static async addAttachment(verificationId, attachmentData) {
    return await prisma.verificationAttachment.create({
      data: {
        verificationId,
        checkId: attachmentData.checkId || null,
        fileName: attachmentData.fileName,
        fileUrl: attachmentData.fileUrl,
        mimeType: attachmentData.mimeType,
        fileSize: attachmentData.fileSize,
        uploadedById: attachmentData.uploadedById
      }
    });
  }
}
