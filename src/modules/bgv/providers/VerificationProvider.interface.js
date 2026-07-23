export class VerificationProvider {
  /**
   * Initiates background verification check.
   * @param {Object} checkData { type, title, candidate, companyId, referenceId }
   * @returns {Promise<{ externalReferenceId: string, status: string, providerName: string, resultData?: Object }>}
   */
  async initiateCheck(checkData) {
    throw new Error("VerificationProvider.initiateCheck() must be implemented by concrete provider.");
  }

  /**
   * Fetches latest check status from third-party provider or manual engine.
   * @param {string} externalReferenceId 
   * @returns {Promise<{ status: string, resultData?: Object, remarks?: string }>}
   */
  async getCheckStatus(externalReferenceId) {
    throw new Error("VerificationProvider.getCheckStatus() must be implemented by concrete provider.");
  }

  /**
   * Manual HR override / verification method.
   * @param {Object} verifyData { status, remarks, verifiedById }
   * @returns {Promise<{ status: string, remarks: string, verifiedAt: Date }>}
   */
  async verifyCheck(verifyData) {
    throw new Error("VerificationProvider.verifyCheck() must be implemented by concrete provider.");
  }
}
