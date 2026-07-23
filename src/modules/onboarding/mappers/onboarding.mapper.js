export class OnboardingMapper {
  static toDto(record) {
    if (!record) return null;

    return {
      id: record.id,
      companyId: record.companyId,
      companyName: record.company ? record.company.name : null,
      offerId: record.offerId,
      candidateId: record.candidateId,
      candidateName: record.candidate ? record.candidate.name : null,
      candidateEmail: record.candidate ? record.candidate.email : null,
      hrOwnerId: record.hrOwnerId,
      hrOwnerName: record.hrOwner ? record.hrOwner.name : null,
      managerId: record.managerId,
      managerName: record.manager ? record.manager.name : null,
      status: record.status,
      currentStage: record.currentStage,
      progressPercentage: record.progressPercentage,
      expectedJoiningDate: record.expectedJoiningDate,
      actualJoiningDate: record.actualJoiningDate,
      notes: record.notes,
      joiningWorkflow: record.joiningWorkflow ? OnboardingMapper.toWorkflowDto(record.joiningWorkflow) : null,
      employeeProfile: record.employeeProfile ? {
        id: record.employeeProfile.id,
        employeeNumber: record.employeeProfile.employeeNumber,
        lifecycleState: record.employeeProfile.lifecycleState
      } : null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  static toWorkflowDto(workflow) {
    if (!workflow) return null;
    return {
      id: workflow.id,
      title: workflow.title,
      assignedHrId: workflow.assignedHrId,
      assignedManagerId: workflow.assignedManagerId,
      stages: workflow.stages || [],
      completedStages: workflow.completedStages,
      totalStages: workflow.totalStages,
      isCompleted: workflow.isCompleted,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt
    };
  }
}
