import prisma from "../../../config/prisma.js";

export class HiringDecisionRepository {
  static async create(data) {
    return await prisma.hiringDecision.create({
      data: {
        companyId: data.companyId,
        applicationId: data.applicationId,
        sessionId: data.sessionId || null,
        candidateId: data.candidateId,
        createdById: data.createdById,
        decisionType: data.decisionType,
        status: data.status || "PENDING",
        reason: data.reason,
        overallScore: data.overallScore || null,
        aiRecommendation: data.aiRecommendation || null,
        version: 1,
        approvals: {
          create: [
            {
              approverId: data.createdById,
              level: 1,
              status: "PENDING",
              comments: "Initial decision creation"
            }
          ]
        },
        history: {
          create: [
            {
              actorId: data.createdById,
              action: "DECISION_CREATED",
              toStatus: data.status || "PENDING",
              notes: "Hiring decision created"
            }
          ]
        },
        audits: {
          create: [
            {
              actorId: data.createdById,
              fieldName: "status",
              oldValue: null,
              newValue: data.status || "PENDING",
              reason: "Initial creation"
            }
          ]
        }
      },
      include: {
        application: true,
        candidate: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        approvals: { include: { approver: { select: { id: true, name: true } } } },
        comments: { include: { author: { select: { id: true, name: true } } } },
        history: { include: { actor: { select: { id: true, name: true } } } }
      }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.hiringDecision.findFirst({
      where,
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true } },
            candidate: { select: { id: true, name: true, email: true } }
          }
        },
        session: true,
        candidate: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        approvals: {
          include: { approver: { select: { id: true, name: true, email: true } } },
          orderBy: { level: "asc" }
        },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        },
        history: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        },
        audits: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.applicationId) where.applicationId = filters.applicationId;
    if (filters.candidateId) where.candidateId = filters.candidateId;

    const [total, data] = await Promise.all([
      prisma.hiringDecision.count({ where }),
      prisma.hiringDecision.findMany({
        where,
        include: {
          application: { select: { id: true, status: true, candidateId: true } },
          candidate: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async update(id, companyId, updateData, actorId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.hiringDecision.updateMany({
      where,
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  static async updateStatusAndRecordHistory(id, companyId, fromStatus, toStatus, action, actorId, notes = null, auditData = null) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    // Transaction to update decision status, append history, and add audit entry
    return await prisma.$transaction([
      prisma.hiringDecision.updateMany({
        where,
        data: { status: toStatus, updatedAt: new Date() }
      }),
      prisma.decisionHistory.create({
        data: {
          decisionId: id,
          actorId,
          action,
          fromStatus,
          toStatus,
          notes
        }
      }),
      prisma.decisionAudit.create({
        data: {
          decisionId: id,
          actorId,
          fieldName: auditData?.fieldName || "status",
          oldValue: auditData?.oldValue || fromStatus,
          newValue: auditData?.newValue || toStatus,
          reason: notes || action
        }
      })
    ]);
  }

  static async addComment(decisionId, authorId, comment, isPrivate = false) {
    return await prisma.decisionComment.create({
      data: {
        decisionId,
        authorId,
        comment,
        isPrivate
      },
      include: { author: { select: { id: true, name: true } } }
    });
  }

  static async getHistory(decisionId) {
    return await prisma.decisionHistory.findMany({
      where: { decisionId },
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
  }
}
