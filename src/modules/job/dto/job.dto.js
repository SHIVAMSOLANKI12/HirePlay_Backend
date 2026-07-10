class JobDTO {
  static toResponse(job) {
    if (!job) return null;

    return {
      id: job.id,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      location: job.location,
      workMode: job.workMode,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      currency: job.currency,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      status: job.status,
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
    };
  }
}

export default JobDTO;
