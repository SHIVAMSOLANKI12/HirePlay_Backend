export class InterviewSessionMapper {
  static toDto(session) {
    if (!session) return null;

    return {
      id: session.id,
      interviewId: session.interviewId,
      companyId: session.companyId,
      title: session.title,
      description: session.description,
      status: session.status,
      meetingProvider: session.meetingProvider,
      meetingUrl: session.meetingUrl,
      meetingRoomId: session.meetingRoomId,
      scheduledAt: session.scheduledAt,
      startedAt: session.startedAt,
      pausedAt: session.pausedAt,
      resumedAt: session.resumedAt,
      completedAt: session.completedAt,
      cancelledAt: session.cancelledAt,
      durationMinutes: session.durationMinutes,
      actualDurationSeconds: session.actualDurationSeconds,
      metadata: session.metadata,
      participants: session.participants ? session.participants.map(InterviewSessionMapper.toParticipantDto) : [],
      timeline: session.timeline ? session.timeline.map(InterviewSessionMapper.toTimelineDto) : [],
      notes: session.notes ? session.notes.map(InterviewSessionMapper.toNoteDto) : [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }

  static toParticipantDto(participant) {
    if (!participant) return null;
    return {
      id: participant.id,
      userId: participant.userId,
      name: participant.name,
      email: participant.email,
      role: participant.role,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      isHost: participant.isHost
    };
  }

  static toTimelineDto(timeline) {
    if (!timeline) return null;
    return {
      id: timeline.id,
      eventType: timeline.eventType,
      description: timeline.description,
      metadata: timeline.metadata,
      createdAt: timeline.createdAt
    };
  }

  static toNoteDto(note) {
    if (!note) return null;
    return {
      id: note.id,
      authorId: note.authorId,
      authorName: note.author ? note.author.name : null,
      noteText: note.noteText,
      isPrivate: note.isPrivate,
      isPinned: note.isPinned,
      timestamp: note.timestamp,
      createdAt: note.createdAt
    };
  }
}
