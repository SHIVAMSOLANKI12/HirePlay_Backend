export const VALID_JOB_TRANSITIONS = {
  PUBLISHED: ["DRAFT", "CLOSED"], // Can become PUBLISHED if it was DRAFT or CLOSED
  DRAFT: ["PUBLISHED"],           // Can become DRAFT if it was PUBLISHED (unpublish)
  CLOSED: ["PUBLISHED"],          // Can become CLOSED if it was PUBLISHED
};

export const JOB_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CLOSED: "CLOSED",
  ARCHIVED: "ARCHIVED"
};
