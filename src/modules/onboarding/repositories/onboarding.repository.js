import prisma from "../../../config/prisma.js";

export class OnboardingRepository {
  static async create(data) {
    const { workflowStages, ...recordData } = data;

    return await prisma.onboardingRecord.create({
      data: {
        companyId: recordData.companyId,
        offerId: recordData.offerId,
        candidateId: recordData.candidateId,
        hrOwnerId: recordData.hrOwnerId,
        managerId: recordData.managerId || null,
        status: recordData.status || "IN_PROGRESS",
        currentStage: recordData.currentStage || "Pre-Joining Document Verification",
        progressPercentage: recordData.progressPercentage || 0.0,
        expectedJoiningDate: new Date(recordData.expectedJoiningDate),
        notes: recordData.notes || null,
        joiningWorkflow: {
          create: {
            title: "Standard Joining Workflow",
            assignedHrId: recordData.hrOwnerId,
            assignedManagerId: recordData.managerId || null,
            stages: workflowStages || [],
            totalStages: workflowStages ? workflowStages.length : 4,
            completedStages: 0,
            isCompleted: false
          }
        }
      },
      include: {
        company: { select: { id: true, name: true } },
        offer: true,
        candidate: { select: { id: true, name: true, email: true } },
        hrOwner: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        joiningWorkflow: true,
        employeeProfile: true
      }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.onboardingRecord.findFirst({
      where,
      include: {
        company: { select: { id: true, name: true } },
        offer: {
          include: {
            job: { select: { id: true, title: true, department: true } }
          }
        },
        candidate: { select: { id: true, name: true, email: true } },
        hrOwner: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        joiningWorkflow: true,
        employeeProfile: true
      }
    });
  }

  static async findByOfferId(offerId, companyId) {
    const where = { offerId, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.onboardingRecord.findFirst({
      where,
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        joiningWorkflow: true,
        employeeProfile: true
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.candidateId) where.candidateId = filters.candidateId;
    if (filters.hrOwnerId) where.hrOwnerId = filters.hrOwnerId;

    const [total, data] = await Promise.all([
      prisma.onboardingRecord.count({ where }),
      prisma.onboardingRecord.findMany({
        where,
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          hrOwner: { select: { id: true, name: true } },
          joiningWorkflow: true,
          employeeProfile: { select: { id: true, employeeNumber: true, lifecycleState: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async update(id, companyId, updateData) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    const { expectedJoiningDate, actualJoiningDate, stages, workflowStages, ...directData } = updateData;
    const dataToUpdate = { ...directData, updatedAt: new Date() };

    if (expectedJoiningDate) dataToUpdate.expectedJoiningDate = new Date(expectedJoiningDate);
    if (actualJoiningDate) dataToUpdate.actualJoiningDate = new Date(actualJoiningDate);

    return await prisma.onboardingRecord.updateMany({
      where,
      data: dataToUpdate
    });
  }

  static async updateWorkflow(onboardingId, workflowData) {
    return await prisma.joiningWorkflow.update({
      where: { onboardingId },
      data: {
        ...workflowData,
        updatedAt: new Date()
      }
    });
  }
}
