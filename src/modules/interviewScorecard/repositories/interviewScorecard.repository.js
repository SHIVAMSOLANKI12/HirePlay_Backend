import prisma from "../../../config/prisma.js";

export class InterviewScorecardRepository {
  static async create(data) {
    const { scores = [], feedback = null, ...cardData } = data;

    return await prisma.interviewScorecard.create({
      data: {
        companyId: cardData.companyId,
        sessionId: cardData.sessionId,
        interviewerId: cardData.interviewerId,
        candidateId: cardData.candidateId,
        title: cardData.title,
        status: cardData.status || "DRAFT",
        recommendation: cardData.recommendation || null,
        recommendationReason: cardData.recommendationReason || null,
        scores: {
          create: scores.map(s => ({
            criterionName: s.criterionName,
            score: Number(s.score),
            maxScore: Number(s.maxScore) || 10.0,
            weight: Number(s.weight) || 1.0,
            comments: s.comments || null
          }))
        },
        feedback: feedback ? {
          create: {
            strengths: feedback.strengths || [],
            weaknesses: feedback.weaknesses || [],
            detailedNotes: feedback.detailedNotes || null,
            privateFeedback: feedback.privateFeedback || null,
            candidateVisibleNotes: feedback.candidateVisibleNotes || null
          }
        } : undefined
      },
      include: {
        scores: true,
        feedback: true,
        interviewer: { select: { id: true, name: true, email: true } },
        candidate: { select: { id: true, name: true, email: true } }
      }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewScorecard.findFirst({
      where,
      include: {
        scores: true,
        feedback: true,
        interviewer: { select: { id: true, name: true, email: true } },
        candidate: { select: { id: true, name: true, email: true } },
        session: true
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.sessionId) where.sessionId = filters.sessionId;
    if (filters.interviewerId) where.interviewerId = filters.interviewerId;

    const [total, data] = await Promise.all([
      prisma.interviewScorecard.count({ where }),
      prisma.interviewScorecard.findMany({
        where,
        include: {
          scores: true,
          feedback: true,
          interviewer: { select: { id: true, name: true } },
          candidate: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async findBySessionId(sessionId, companyId) {
    const where = { sessionId, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewScorecard.findMany({
      where,
      include: {
        scores: true,
        feedback: true,
        interviewer: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  static async update(id, companyId, updateData) {
    const { scores, feedback, ...directData } = updateData;
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    if (scores && scores.length > 0) {
      // Re-create score items
      await prisma.evaluationScore.deleteMany({ where: { scorecardId: id } });
      await prisma.evaluationScore.createMany({
        data: scores.map(s => ({
          scorecardId: id,
          criterionName: s.criterionName,
          score: Number(s.score),
          maxScore: Number(s.maxScore) || 10.0,
          weight: Number(s.weight) || 1.0,
          comments: s.comments || null
        }))
      });
    }

    if (feedback) {
      await prisma.interviewerFeedback.upsert({
        where: { scorecardId: id },
        create: {
          scorecardId: id,
          strengths: feedback.strengths || [],
          weaknesses: feedback.weaknesses || [],
          detailedNotes: feedback.detailedNotes || null,
          privateFeedback: feedback.privateFeedback || null,
          candidateVisibleNotes: feedback.candidateVisibleNotes || null
        },
        update: {
          strengths: feedback.strengths || [],
          weaknesses: feedback.weaknesses || [],
          detailedNotes: feedback.detailedNotes || null,
          privateFeedback: feedback.privateFeedback || null,
          candidateVisibleNotes: feedback.candidateVisibleNotes || null
        }
      });
    }

    return await prisma.interviewScorecard.updateMany({
      where,
      data: {
        ...directData,
        updatedAt: new Date()
      }
    });
  }

  static async updateStatus(id, companyId, status, additionalData = {}) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewScorecard.updateMany({
      where,
      data: {
        status,
        ...additionalData,
        updatedAt: new Date()
      }
    });
  }
}
