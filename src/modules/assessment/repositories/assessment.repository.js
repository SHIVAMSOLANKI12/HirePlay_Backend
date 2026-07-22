import prisma from "../../../config/prisma.js";

export class AssessmentRepository {
  static async create(data) {
    return await prisma.assessment.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        description: data.description,
        status: data.status,
        createdBy: data.createdBy,
        scoringProfile: data.scoringProfile || null,
        games: {
          create: data.games || []
        }
      },
      include: {
        games: true
      }
    });
  }

  static async findById(id) {
    return await prisma.assessment.findUnique({
      where: { id },
      include: { games: true }
    });
  }

  static async findByCompanyId(companyId, skip = 0, take = 10) {
    const [total, data] = await Promise.all([
      prisma.assessment.count({ where: { companyId, deletedAt: null } }),
      prisma.assessment.findMany({
        where: { companyId, deletedAt: null },
        include: { games: true },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(take),
      })
    ]);

    return { total, data };
  }

  static async update(id, data) {
    // If games are provided, we should ideally handle nested updates, 
    // but for infrastructure we just update top level fields
    const updateData = { ...data };
    delete updateData.games; 

    return await prisma.assessment.update({
      where: { id },
      data: updateData,
      include: { games: true }
    });
  }

  static async softDelete(id) {
    return await prisma.assessment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
