import AppError from "../../../utils/AppError.js";
import { findRecruiterApplicationDetails } from "../repositories/application.repository.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { toRecruiterDetails } from "../../shared/mappers/application.mapper.js";

export const getRecruiterApplicationDetailsService = async (user, applicationId) => {
  // 1. Fetch complete applicant information
  const application = await findRecruiterApplicationDetails(applicationId);
  
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  // 2. Verify recruiter access (implicitly validates ownership by company)
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Map to consistent Recruiter response
  return toRecruiterDetails(application);
};
