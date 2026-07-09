export const COMPANY_MESSAGES = Object.freeze({
  CREATED: "Company created successfully.",
  UPDATED: "Company updated successfully.",
  FETCHED: "Company fetched successfully.",
  DELETED: "Company deleted successfully.",
  RESTORED: "Company restored successfully.",
  NOT_FOUND: "Company not found.",
  ALREADY_EXISTS: "Company already exists.",
  OWNER_ALREADY_HAS_COMPANY: "You already own a company.",
  UNAUTHORIZED: "Unauthorized",
  LOGO_UPDATED: "Company logo updated successfully.",
  SETTINGS_UPDATED: "Company settings updated successfully.",
});

export const COMPANY_HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
});
