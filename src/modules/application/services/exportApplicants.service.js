import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { buildSearchCondition } from "../../shared/services/search.service.js";
import prisma from "../../../config/prisma.js";

/**
 * Async generator that yields formatted CSV rows for applicants in memory-efficient chunks.
 */
export async function* getApplicantsCSVStream(user, jobId, queryParams, batchSize = 100) {
  // 1. Verify Job existence and ownership
  await verifyRecruiterJobAccess(user, jobId);

  const {
    status,
    search,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    hasResume,
  } = queryParams;

  // 2. Sorting Setup
  let orderBy = {};
  const orderDirection = ["asc", "desc"].includes(sortOrder?.toLowerCase()) ? sortOrder.toLowerCase() : "desc";
  if (sortBy === "candidateName") {
    orderBy = { candidate: { name: orderDirection } };
  } else if (sortBy === "status") {
    orderBy = { status: orderDirection };
  } else {
    orderBy = { appliedAt: orderDirection };
  }
  
  // 3. Search & Filter Setup
  const searchCondition = buildSearchCondition(search, ["candidate.name", "candidate.email", "resume.originalName"]);

  const where = {
    jobId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(searchCondition ? { ...searchCondition } : {}),
  };

  if (dateFrom || dateTo) {
    where.appliedAt = {};
    if (dateFrom) where.appliedAt.gte = new Date(dateFrom);
    if (dateTo) where.appliedAt.lte = new Date(dateTo);
  }

  if (hasResume !== undefined) {
    where.resumeId = hasResume ? { not: null } : null;
  }

  // 4. Yield CSV Headers
  yield "Candidate Name,Email,Job,Status,Applied Date,Resume\n";

  // 5. Chunked Fetching
  let skip = 0;
  while (true) {
    const batch = await prisma.application.findMany({
      where,
      orderBy,
      take: batchSize,
      skip,
      select: {
        status: true,
        appliedAt: true,
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
        resume: {
          select: {
            originalName: true,
          },
        },
      },
    });

    if (batch.length === 0) {
      break;
    }

    // Process and yield rows
    for (const app of batch) {
      const row = [
        app.candidate.name || "",
        app.candidate.email || "",
        app.job.title || "",
        app.status || "",
        app.appliedAt ? app.appliedAt.toISOString() : "",
        app.resume ? app.resume.originalName : "",
      ];

      // Escape quotes and wrap each field in quotes
      const escapedRow = row
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",");

      yield escapedRow + "\n";
    }

    skip += batchSize;
  }
}
