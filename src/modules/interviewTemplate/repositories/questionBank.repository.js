import prisma from "../../../config/prisma.js";

export class QuestionBankRepository {
  static async create(data) {
    return await prisma.interviewQuestion.create({
      data: {
        companyId: data.companyId,
        categoryId: data.categoryId || null,
        title: data.title,
        questionText: data.questionText,
        type: data.type,
        difficulty: data.difficulty || "MEDIUM",
        sampleAnswer: data.sampleAnswer || null,
        scoringRubric: data.scoringRubric || null,
        tags: data.tags || []
      },
      include: {
        category: true
      }
    });
  }

  static async findById(id, companyId) {
    return await prisma.interviewQuestion.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null
      },
      include: {
        category: true
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = {
      companyId,
      deletedAt: null
    };

    if (filters.type) where.type = filters.type;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { questionText: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    const [total, data] = await Promise.all([
      prisma.interviewQuestion.count({ where }),
      prisma.interviewQuestion.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async update(id, companyId, updateData) {
    return await prisma.interviewQuestion.updateMany({
      where: { id, companyId, deletedAt: null },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  static async softDelete(id, companyId) {
    return await prisma.interviewQuestion.updateMany({
      where: { id, companyId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }
}
