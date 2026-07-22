import prisma from "../../../config/prisma.js";

export class InterviewSessionRepository {
  static async create(data) {
    const { participants = [], ...sessionData } = data;

    return await prisma.interviewSession.create({
      data: {
        interviewId: sessionData.interviewId || null,
        companyId: sessionData.companyId,
        title: sessionData.title,
        description: sessionData.description || null,
        status: sessionData.status || "SCHEDULED",
        meetingProvider: sessionData.meetingProvider || "INTERNAL",
        meetingUrl: sessionData.meetingUrl || null,
        meetingRoomId: sessionData.meetingRoomId || null,
        scheduledAt: new Date(sessionData.scheduledAt),
        durationMinutes: sessionData.durationMinutes || 45,
        metadata: sessionData.metadata || null,
        participants: {
          create: participants.map(p => ({
            userId: p.userId || null,
            name: p.name,
            email: p.email,
            role: p.role || "INTERVIEWER",
            isHost: p.isHost || false
          }))
        },
        timeline: {
          create: {
            eventType: "INTERVIEW_SCHEDULED",
            description: `Interview session scheduled for ${sessionData.scheduledAt}`,
            metadata: { scheduledAt: sessionData.scheduledAt }
          }
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        timeline: { orderBy: { createdAt: "asc" } },
        notes: { orderBy: { createdAt: "desc" } }
      }
    });
  }

  static async findById(id, companyId) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewSession.findFirst({
      where,
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        timeline: { orderBy: { createdAt: "asc" } },
        events: { orderBy: { createdAt: "asc" } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, name: true, email: true } } }
        },
        interview: true
      }
    });
  }

  static async findByCompanyId(companyId, filters = {}, skip = 0, take = 10) {
    const where = { companyId, deletedAt: null };
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    const [total, data] = await Promise.all([
      prisma.interviewSession.count({ where }),
      prisma.interviewSession.findMany({
        where,
        include: {
          participants: true,
          _count: { select: { notes: true, timeline: true } }
        },
        orderBy: { scheduledAt: "desc" },
        skip: Number(skip),
        take: Number(take)
      })
    ]);

    return { total, data };
  }

  static async updateStatus(id, companyId, status, additionalData = {}) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewSession.updateMany({
      where,
      data: {
        status,
        ...additionalData,
        updatedAt: new Date()
      }
    });
  }

  static async update(id, companyId, updateData) {
    const where = { id, deletedAt: null };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewSession.updateMany({
      where,
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
  }

  static async addTimelineEvent(sessionId, eventType, description, metadata = null) {
    return await prisma.interviewTimeline.create({
      data: {
        sessionId,
        eventType,
        description,
        metadata
      }
    });
  }

  static async addNote(sessionId, authorId, noteText, isPrivate = false, isPinned = false) {
    return await prisma.interviewNote.create({
      data: {
        sessionId,
        authorId,
        noteText,
        isPrivate,
        isPinned
      },
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    });
  }

  static async getTimeline(sessionId, companyId) {
    const session = await this.findById(sessionId, companyId);
    if (!session) return null;
    return session.timeline;
  }
}
