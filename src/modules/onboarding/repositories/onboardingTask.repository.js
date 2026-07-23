import prisma from "../../../config/prisma.js";

export class OnboardingTaskRepository {
  static async createTaskTemplate(data) {
    return await prisma.onboardingTaskTemplate.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        description: data.description || null,
        category: data.category || "CUSTOM",
        isRequired: data.isRequired !== undefined ? data.isRequired : true,
        assignedRole: data.assignedRole || "HR",
        daysDueFromJoining: Number(data.daysDueFromJoining) || 0
      }
    });
  }

  static async findTaskTemplatesByCompanyId(companyId) {
    return await prisma.onboardingTaskTemplate.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "asc" }
    });
  }

  static async createTask(data) {
    return await prisma.onboardingTask.create({
      data: {
        onboardingId: data.onboardingId,
        templateId: data.templateId || null,
        title: data.title,
        description: data.description || null,
        category: data.category || "CUSTOM",
        status: data.status || "PENDING",
        isRequired: data.isRequired !== undefined ? data.isRequired : true,
        assignedToId: data.assignedToId || null,
        assignedRole: data.assignedRole || "HR",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        comments: data.comments || null
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        completedBy: { select: { id: true, name: true, email: true } }
      }
    });
  }

  static async findTasksByOnboardingId(onboardingId) {
    return await prisma.onboardingTask.findMany({
      where: { onboardingId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        completedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  static async updateTask(taskId, updateData) {
    return await prisma.onboardingTask.update({
      where: { id: taskId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        completedBy: { select: { id: true, name: true, email: true } }
      }
    });
  }
}
