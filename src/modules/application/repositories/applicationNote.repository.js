import prisma from "../../../config/prisma.js";

export const createApplicationNote = async (data, tx = prisma) => {
  return tx.applicationNote.create({
    data,
    select: {
      id: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findApplicationNotes = async (applicationId) => {
  return prisma.applicationNote.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findApplicationNoteById = async (noteId) => {
  return prisma.applicationNote.findUnique({
    where: { id: noteId },
    select: {
      id: true,
      applicationId: true,
      authorId: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const updateApplicationNote = async (noteId, note, tx = prisma) => {
  return tx.applicationNote.update({
    where: { id: noteId },
    data: { note },
    select: {
      id: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteApplicationNote = async (noteId, tx = prisma) => {
  return tx.applicationNote.delete({
    where: { id: noteId },
  });
};
