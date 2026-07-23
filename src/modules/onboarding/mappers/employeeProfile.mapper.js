export class EmployeeProfileMapper {
  static toDto(profile) {
    if (!profile) return null;

    return {
      id: profile.id,
      companyId: profile.companyId,
      companyName: profile.company ? profile.company.name : null,
      userId: profile.userId,
      employeeName: profile.user ? profile.user.name : null,
      employeeEmail: profile.user ? profile.user.email : null,
      onboardingId: profile.onboardingId,
      employeeNumber: profile.employeeNumber,
      employmentType: profile.employmentType,
      department: profile.department,
      designation: profile.designation,
      managerId: profile.managerId,
      managerName: profile.manager ? profile.manager.name : null,
      joiningDate: profile.joiningDate,
      probationPeriodMonths: profile.probationPeriodMonths,
      probationEndDate: profile.probationEndDate,
      workLocation: profile.workLocation,
      workMode: profile.workMode,
      salary: profile.salary,
      currency: profile.currency,
      lifecycleState: profile.lifecycleState,
      lifecycleHistory: profile.lifecycleHistory
        ? profile.lifecycleHistory.map(EmployeeProfileMapper.toHistoryDto)
        : [],
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  }

  static toHistoryDto(historyItem) {
    if (!historyItem) return null;
    return {
      id: historyItem.id,
      performedById: historyItem.performedById,
      performedByName: historyItem.performedBy ? historyItem.performedBy.name : null,
      fromState: historyItem.fromState,
      toState: historyItem.toState,
      reason: historyItem.reason,
      createdAt: historyItem.createdAt
    };
  }
}
