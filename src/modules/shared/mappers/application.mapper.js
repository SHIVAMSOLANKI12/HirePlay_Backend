/**
 * Transforms a raw Prisma Application object into a standardized API Summary response.
 */
export const toSummary = (app) => ({
  id: app.id,
  status: app.status,
  appliedAt: app.appliedAt,
  updatedAt: app.updatedAt,
  candidate: app.candidate
    ? {
        id: app.candidate.id,
        name: app.candidate.name,
      }
    : undefined,
  job: app.job
    ? {
        id: app.job.id,
        title: app.job.title,
      }
    : undefined,
  resume: app.resume
    ? {
        id: app.resume.id,
        originalName: app.resume.originalName,
      }
    : undefined,
});

/**
 * Transforms a raw Prisma Application object into a standardized API Details response.
 */
export const toDetails = (app) => ({
  ...toSummary(app),
  coverLetter: app.coverLetter,
  company: app.job?.company
    ? {
        id: app.job.company.id,
        name: app.job.company.name,
        logo: app.job.company.logo,
      }
    : undefined,
});

/**
 * Transforms a raw Prisma Application object into a standardized Recruiter API Details response.
 */
export const toRecruiterDetails = (app) => ({
  id: app.id,
  status: app.status,
  appliedAt: app.appliedAt,
  updatedAt: app.updatedAt,
  coverLetter: app.coverLetter,
  candidate: app.candidate
    ? {
        id: app.candidate.id,
        name: app.candidate.name,
        email: app.candidate.email,
      }
    : undefined,
  job: app.job
    ? {
        id: app.job.id,
        title: app.job.title,
        location: app.job.location,
        employmentType: app.job.employmentType,
      }
    : undefined,
  company: app.job?.company
    ? {
        id: app.job.company.id,
        name: app.job.company.name,
        logo: app.job.company.logo,
      }
    : undefined,
  resume: app.resume
    ? {
        id: app.resume.id,
        originalName: app.resume.originalName,
        fileUrl: app.resume.fileUrl,
      }
    : undefined,
});

/**
 * Utility to map an array of Prisma objects using a specific mapping function.
 */
export const toList = (apps, mapper = toSummary) => apps.map(mapper);
