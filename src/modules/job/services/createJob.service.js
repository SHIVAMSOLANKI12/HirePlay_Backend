import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { createJob } from "../repositories/job.repository.js";
import JobMapper from "../mappers/job.mapper.js";
import JobDTO from "../dto/job.dto.js";

export const createJobService = async (user, payload) => {
  let companyId = user.companyId;

  // If companyId is not in JWT (e.g., Company Admin / Owner), fetch it
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to create a job.", 404);
  }

  const jobData = JobMapper.toCreateData(payload, companyId, user.id);

  const newJob = await createJob(jobData);

  // Track reusable ActivityLog for dashboards
  const { createActivityLog } = await import("../../activity/services/activityLog.service.js");
  await createActivityLog({
    userId: user.id,
    companyId: companyId,
    applicationId: null,
    jobId: newJob.id,
    type: "JOB_CREATED",
    title: "Job Created",
    description: `Created new job: ${newJob.title}.`,
    metadata: null,
  });

  return JobDTO.toResponse(newJob);
};
