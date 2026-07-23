import { VerificationProvider } from "./VerificationProvider.interface.js";

export class ManualVerificationProvider extends VerificationProvider {
  async initiateCheck(checkData) {
    const externalReferenceId = `MANUAL-BGV-${Date.now()}`;
    return {
      externalReferenceId,
      status: "IN_PROGRESS",
      providerName: "MANUAL",
      resultData: {
        initiationType: "MANUAL_HR",
        checkType: checkData.type || "IDENTITY",
        candidateName: checkData.candidateName || null
      }
    };
  }

  async getCheckStatus(externalReferenceId) {
    return {
      status: "IN_PROGRESS",
      remarks: "Awaiting HR manual review and document verification"
    };
  }

  async verifyCheck(verifyData) {
    return {
      status: verifyData.status || "VERIFIED",
      remarks: verifyData.remarks || "Manually verified by HR",
      verifiedAt: new Date()
    };
  }
}
