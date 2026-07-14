/**
 * Transforms a raw Prisma ApplicationNote object into a standardized API Details response.
 */
export const toApplicationNote = (note) => ({
  id: note.id,
  note: note.note,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
  author: note.author
    ? {
        id: note.author.id,
        name: note.author.name,
      }
    : undefined,
});

/**
 * Utility to map an array of Prisma objects using the ApplicationNote mapping function.
 */
export const toApplicationNoteList = (notes) => notes.map(toApplicationNote);
