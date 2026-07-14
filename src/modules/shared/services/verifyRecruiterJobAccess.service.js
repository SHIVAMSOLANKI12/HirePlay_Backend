import { z } from "zod";
import AppError from "../../../utils/AppError.js";
import { findActiveJobById } from "../../job/repositories/job.repository.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { uuidSchema } from "../validators/uuid.validator.js";

export const verifyRecruiterJobAccess = async (user, jobId) => {
  // Step 1: Validate Job ID
  const jobUuidSchema = uuidSchema("Invalid Job ID");
  const validationResult = jobUuidSchema.safeParse(jobId);
  
  if (!validationResult.success) {
    throw new AppError("Invalid Job ID", 400);
  }

  // Step 2 & 3: Fetch Job and check if it exists & is not soft deleted
  const job = await findActiveJobById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  // Step 4: Fetch logged-in user's company
  let companyId = user.companyId;

  // Resolve companyId for COMPANY_ADMIN if it's not present directly on user object
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Job not found", 404);
  }

  // Step 5: Verify job.companyId matches user's companyId
  if (job.companyId !== companyId) {
    throw new AppError("Job not found", 404); // Do not return 403 to prevent resource leaking
  }

  // Step 6: Return the verified Job object
  return job;
};
