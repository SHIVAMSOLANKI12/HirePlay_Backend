import prisma from "../../../config/prisma.js";

/**
 * Creates a new feedback record.
 */
export const createFeedback = async (data, tx = prisma) => {
  return tx.interviewFeedback.create({
    data,
    select: {
      id: true,
      interviewId: true,
      interviewerId: true,
      overallRating: true,
      recommendation: true,
      technicalScore: true,
      communicationScore: true,
      problemSolvingScore: true,
      cultureFitScore: true,
      strengths: true,
      weaknesses: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Updates an existing feedback record.
 */
export const updateFeedback = async (id, data, tx = prisma) => {
  return tx.interviewFeedback.update({
    where: { id },
    data,
    select: {
      id: true,
      interviewId: true,
      interviewerId: true,
      overallRating: true,
      recommendation: true,
      technicalScore: true,
      communicationScore: true,
      problemSolvingScore: true,
      cultureFitScore: true,
      strengths: true,
      weaknesses: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Finds a specific feedback by interview ID and interviewer ID.
 */
export const findFeedbackByInterviewer = async (interviewId, interviewerId, tx = prisma) => {
  return tx.interviewFeedback.findUnique({
    where: {
      interviewId_interviewerId: {
        interviewId,
        interviewerId,
      },
    },
    select: {
      id: true,
      interviewId: true,
      interviewerId: true,
      overallRating: true,
      recommendation: true,
      technicalScore: true,
      communicationScore: true,
      problemSolvingScore: true,
      cultureFitScore: true,
      strengths: true,
      weaknesses: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Finds all feedbacks for an interview.
 */
export const findFeedbacksByInterview = async (interviewId, tx = prisma) => {
  return tx.interviewFeedback.findMany({
    where: { interviewId },
    select: {
      id: true,
      interviewId: true,
      interviewerId: true,
      overallRating: true,
      recommendation: true,
      technicalScore: true,
      communicationScore: true,
      problemSolvingScore: true,
      cultureFitScore: true,
      strengths: true,
      weaknesses: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};
