import { createTimelineEvent, createAuditLog } from "../repositories/offerAudit.repository.js";

const FIELDS_TO_TRACK = [
  "status", "salary", "joiningDate", "location", "department", 
  "employmentType", "reportingManager", "notes", "validUntil"
];

export const trackOfferChanges = async (offerId, oldOffer, newOffer, user, req, tx) => {
  if (!oldOffer || !newOffer) return;

  const ipAddress = req?.ip || "SYSTEM";
  const userAgent = req?.headers ? req.headers["user-agent"] : "SYSTEM";
  
  const performedById = user?.id || null;
  const performedByRole = user?.role || "SYSTEM";

  const auditPromises = [];

  for (const field of FIELDS_TO_TRACK) {
    let oldVal = oldOffer[field];
    let newVal = newOffer[field];

    // Normalize dates for comparison
    if (oldVal instanceof Date) oldVal = oldVal.toISOString();
    if (newVal instanceof Date) newVal = newVal.toISOString();
    
    // Normalize strings
    if (oldVal !== null && oldVal !== undefined) oldVal = oldVal.toString();
    if (newVal !== null && newVal !== undefined) newVal = newVal.toString();

    if (oldVal !== newVal) {
      auditPromises.push(
        createAuditLog({
          offerId,
          action: `UPDATE_${field.toUpperCase()}`,
          performedById,
          performedByRole,
          field,
          oldValue: oldVal || null,
          newValue: newVal || null,
          ipAddress,
          userAgent
        }, tx)
      );
    }
  }

  if (auditPromises.length > 0) {
    await Promise.all(auditPromises);
  }
};

export const logOfferTimeline = async (offerId, type, title, description, user, tx) => {
  await createTimelineEvent({
    offerId,
    type,
    title,
    description,
    performedById: user?.id || null,
    performedByRole: user?.role || "SYSTEM"
  }, tx);
};
