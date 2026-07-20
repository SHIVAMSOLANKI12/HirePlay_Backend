import { fetchActivityById, fetchActivities } from "../services/activityLog.service.js";
import { toActivityLogDTO, toActivityLogsDTO } from "../mappers/activityLog.mapper.js";

export const executeGetActivityById = async (companyId, activityId) => {
  const activity = await fetchActivityById(companyId, activityId);
  return toActivityLogDTO(activity);
};

export const executeGetActivities = async (companyId, filters) => {
  const result = await fetchActivities(companyId, filters);
  return {
    ...result,
    data: toActivityLogsDTO(result.data)
  };
};
