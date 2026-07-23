import prisma from "../../../config/prisma.js";

export class EmployeeProfileRepository {
  static async create(data) {
    const { historyReason, historyActorId, ...profileData } = data;

    return await prisma.employeeProfile.create({
      data: {
        companyId: profileData.companyId,
        userId: profileData.userId,
        onboardingId: profileData.onboardingId || null,
        employeeNumber: profileData.employeeNumber,
        employmentType: profileData.employmentType || "FULL_TIME",
        department: profileData.department,
        designation: profileData.designation,
        managerId: profileData.managerId || null,
        joiningDate: new Date(profileData.joiningDate),
        probationPeriodMonths: Number(profileData.probationPeriodMonths) || 3,
        probationEndDate: profileData.probationEndDate ? new Date(profileData.probationEndDate) : null,
        workLocation: profileData.workLocation || "Head Office",
        workMode: profileData.workMode || "ONSITE",
        salary: profileData.salary ? Number(profileData.salary) : null,
        currency: profileData.currency || "USD",
        lifecycleState: profileData.lifecycleState || "JOINED",
        lifecycleHistory: historyActorId ? {
          create: {
            performedById: historyActorId,
            fromState: "PRE_JOINING",
            toState: profileData.lifecycleState || "JOINED",
            reason: historyReason || "Initial Employee Profile Activation"
          }
        } : undefined
      },
      include: {
        company: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        onboarding: true,
        lifecycleHistory: {
          include: { performedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async findById(id, companyId) {
    const where = { deletedAt: null };
    if (companyId) where.companyId = companyId;

    // Can find by UUID or employeeNumber
    const isUuid = id.length === 36 && id.includes("-");
    if (isUuid) {
      where.id = id;
    } else {
      where.employeeNumber = id;
    }

    return await prisma.employeeProfile.findFirst({
      where,
      include: {
        company: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        onboarding: true,
        lifecycleHistory: {
          include: { performedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async findByUserId(userId, companyId) {
    const where = { userId, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.employeeProfile.findFirst({
      where,
      include: {
        company: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true } }
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.department) where.department = filters.department;
    if (filters.designation) where.designation = filters.designation;
    if (filters.lifecycleState) where.lifecycleState = filters.lifecycleState;

    const [total, data] = await Promise.all([
      prisma.employeeProfile.count({ where }),
      prisma.employeeProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          manager: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async updateState(id, companyId, fromState, toState, actorId, reason = null) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.$transaction([
      prisma.employeeProfile.updateMany({
        where,
        data: { lifecycleState: toState, updatedAt: new Date() }
      }),
      prisma.employeeLifecycleHistory.create({
        data: {
          employeeProfileId: id,
          performedById: actorId,
          fromState,
          toState,
          reason
        }
      })
    ]);
  }
}
