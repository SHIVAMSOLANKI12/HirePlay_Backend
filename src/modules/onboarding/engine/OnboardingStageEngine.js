export class OnboardingStageEngine {
  /**
   * Returns default configurable joining workflow stages.
   * @returns {Array<Object>}
   */
  static getDefaultStages() {
    return [
      { id: 1, name: "Document Verification", description: "Collect identity, education, and prior work credentials", status: "PENDING" },
      { id: 2, name: "Background Verification", description: "Verify criminal record and employment history", status: "PENDING" },
      { id: 3, name: "IT Provisioning", description: "Assign company email, hardware, and system access", status: "PENDING" },
      { id: 4, name: "Orientation & Joining", description: "HR orientation, policy signing, and official joining", status: "PENDING" }
    ];
  }

  /**
   * Calculates progress percentage based on completed workflow stages.
   * @param {Array<Object>} stages 
   * @returns {{ progressPercentage: number, completedStages: number, totalStages: number, isCompleted: boolean }}
   */
  static calculateProgress(stages = []) {
    if (!stages || stages.length === 0) {
      return { progressPercentage: 0, completedStages: 0, totalStages: 0, isCompleted: false };
    }

    const completedStages = stages.filter(s => s.status === "COMPLETED").length;
    const totalStages = stages.length;
    const progressPercentage = Math.round((completedStages / totalStages) * 100 * 10) / 10;
    const isCompleted = completedStages === totalStages;

    return {
      progressPercentage,
      completedStages,
      totalStages,
      isCompleted
    };
  }

  /**
   * Validates state transitions for Employee Lifecycle.
   * @param {string} currentState 
   * @param {string} targetState 
   * @returns {boolean}
   */
  static validateLifecycleTransition(currentState, targetState) {
    const validTransitions = {
      PRE_JOINING: ["JOINING_PENDING", "JOINED", "CANCELLED"],
      JOINING_PENDING: ["JOINED", "CANCELLED"],
      JOINED: ["PROBATION", "CONFIRMED", "INACTIVE"],
      PROBATION: ["CONFIRMED", "INACTIVE", "EXITED"],
      CONFIRMED: ["INACTIVE", "EXITED"],
      INACTIVE: ["CONFIRMED", "EXITED"],
      EXITED: []
    };

    const allowed = validTransitions[currentState] || [];
    return allowed.includes(targetState);
  }
}
