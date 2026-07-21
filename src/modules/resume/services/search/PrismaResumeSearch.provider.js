import { ResumeSearchProvider } from "./ResumeSearchProvider.interface.js";
import prisma from "../../../../config/prisma.js";

export class PrismaResumeSearchProvider extends ResumeSearchProvider {
  async search(companyId, queryOptions = {}) {
    const {
      q,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      skills,
      resumeStatus,
      parsingStatus,
      uploadedAfter,
      uploadedBefore,
    } = queryOptions;

    const skip = (page - 1) * limit;

    // Base isolation condition: Only resumes that have been submitted to a job belonging to this company.
    const where = {
      deletedAt: null,
      applications: {
        some: {
          job: { companyId },
        },
      },
    };

    if (resumeStatus !== undefined) {
      where.isActive = resumeStatus;
    } else {
      // Default to active resumes only
      where.isActive = true;
    }

    if (parsingStatus) {
      where.parsingStatus = parsingStatus;
    }

    if (uploadedAfter || uploadedBefore) {
      where.createdAt = {};
      if (uploadedAfter) where.createdAt.gte = new Date(uploadedAfter);
      if (uploadedBefore) where.createdAt.lte = new Date(uploadedBefore);
    }

    if (q && q.trim()) {
      const searchStr = q.trim();
      where.OR = [
        { candidate: { name: { contains: searchStr, mode: "insensitive" } } },
        { candidate: { email: { contains: searchStr, mode: "insensitive" } } },
        { originalName: { contains: searchStr, mode: "insensitive" } },
        { parsedData: { path: ["email"], string_contains: searchStr } },
        { parsedData: { path: ["phone"], string_contains: searchStr } },
        { parsedData: { path: ["experience"], string_contains: searchStr } },
        { parsedData: { path: ["education"], string_contains: searchStr } },
        { parsedData: { path: ["projects"], string_contains: searchStr } },
      ];
    }

    if (skills && skills.length > 0) {
      // Ensure AND is initialized
      if (!where.AND) where.AND = [];
      
      // For JSON array filtering in Prisma Postgres
      skills.forEach(skill => {
        where.AND.push({
          parsedData: {
            path: ["skills"],
            array_contains: [skill]
          }
        });
      });
    }

    // Handle nested sorting like candidateName -> candidate.name
    let orderBy = {};
    if (sortBy === "candidateName") {
      orderBy = { candidate: { name: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [total, data] = await Promise.all([
      prisma.resume.count({ where }),
      prisma.resume.findMany({
        where,
        orderBy,
        skip: Number(skip),
        take: Number(limit),
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })
    ]);

    return {
      total,
      data,
      page: Number(page),
      limit: Number(limit)
    };
  }

  async getSuggestions(companyId, field) {
    if (field === "skills") {
      // Query raw to extract distinct skills from the parsedData JSON array 
      // for all resumes connected to the given company.
      const results = await prisma.$queryRaw`
        SELECT DISTINCT jsonb_array_elements_text("parsedData"->'skills') as skill
        FROM "Resume" r
        INNER JOIN "Application" a ON a."resumeId" = r.id
        INNER JOIN "Job" j ON a."jobId" = j.id
        WHERE j."companyId" = ${companyId}
          AND r."deletedAt" IS NULL
          AND r."isActive" = true
          AND r."parsedData" IS NOT NULL
          AND r."parsedData"->'skills' IS NOT NULL
        ORDER BY skill ASC
        LIMIT 100
      `;
      
      return results.map(row => row.skill);
    }
  
    return [];
  }
}
