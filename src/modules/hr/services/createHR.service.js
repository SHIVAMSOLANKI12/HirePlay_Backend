import AppError from "../../../utils/AppError.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findHRByEmail, createHR } from "../repositories/hr.repository.js";
import bcrypt from "bcrypt";
import HRMapper from "../mappers/hr.mapper.js";
import HRDTO from "../dto/hr.dto.js";

export const createHRService = async (ownerId, payload) => {
  // Check if company exists for this owner
  const existingCompany = await findCompanyByOwnerId(ownerId);
  if (!existingCompany) {
    throw new AppError("Company not found. You must create a company first.", 404);
  }

  // Check duplicate HR email
  const existingHR = await findHRByEmail(payload.email);
  if (existingHR) {
    throw new AppError("An HR with this email already exists.", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // Map to db object
  const hrData = HRMapper.toCreateData(payload, existingCompany.id, hashedPassword);

  // Save to DB
  const newHR = await createHR(hrData);

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.HR_CREATED, {
    companyId: existingCompany.id,
    userId: ownerId, // Track under the Company Admin's ID in Notification table
    type: "SYSTEM",
    channel: "EMAIL",
    title: "HR Account Created",
    message: `Your HR account for ${existingCompany.name} has been created.`,
    metadata: { hrId: newHR.id },
    eventName: NOTIFICATION_EVENTS.HR_CREATED,
    UserName: newHR.firstName,
    CompanyName: existingCompany.name,
    LoginLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    recipientEmail: newHR.email // Email service will use this to send to HR directly
  });

  eventEngine.emit(ACTIVITY_EVENTS.HR_CREATED, {
    userId: ownerId,
    companyId: existingCompany.id,
    entityId: newHR.id,
    performedByRole: "COMPANY_OWNER",
    metadata: { hrEmail: newHR.email }
  });

  // Return DTO
  return HRDTO.toResponse(newHR);
};
