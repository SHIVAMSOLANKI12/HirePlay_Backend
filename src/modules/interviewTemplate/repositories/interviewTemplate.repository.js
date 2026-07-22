import prisma from "../../../config/prisma.js";

export class InterviewTemplateRepository {
  static async create(data) {
    const { rounds = [], criteria = [], questionIds = [], ...templateData } = data;

    return await prisma.interviewTemplate.create({
      data: {
        companyId: templateData.companyId,
        createdById: templateData.createdById,
        title: templateData.title,
        description: templateData.description || null,
        status: templateData.status || "ACTIVE",
        isDefault: templateData.isDefault || false,
        rounds: {
          create: rounds.map((r, index) => ({
            roundName: r.roundName,
            roundType: r.roundType,
            sequence: r.sequence || index + 1,
            expectedDurationMinutes: r.expectedDurationMinutes || 45,
            questionCount: r.questionCount || 5,
            passingScore: r.passingScore || 70.0
          }))
        },
        criteria: {
          create: criteria.map(c => ({
            companyId: templateData.companyId,
            name: c.name,
            description: c.description || null,
            weight: c.weight || 1.0,
            maxScore: c.maxScore || 10.0
          }))
        },
        templateQuestions: {
          create: questionIds.map((qId, index) => ({
            questionId: qId,
            order: index + 1
          }))
        }
      },
      include: {
        rounds: true,
        criteria: true,
        templateQuestions: {
          include: {
            question: {
              include: { category: true }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  static async findById(id, companyId) {
    return await prisma.interviewTemplate.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        rounds: {
          orderBy: { sequence: "asc" }
        },
        criteria: true,
        templateQuestions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              include: { category: true }
            }
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    const [total, data] = await Promise.all([
      prisma.interviewTemplate.count({ where }),
      prisma.interviewTemplate.findMany({
        where,
        include: {
          rounds: true,
          criteria: true,
          createdBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async update(id, companyId, updateData) {
    const { rounds, criteria, questionIds, ...directData } = updateData;

    return await prisma.interviewTemplate.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        ...directData,
        updatedAt: new Date()
      }
    });
  }

  static async softDelete(id, companyId) {
    return await prisma.interviewTemplate.updateMany({
      where: { id, companyId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }
}
