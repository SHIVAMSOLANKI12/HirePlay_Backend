import AppError from "../../../../utils/AppError.js";
import { toHRProfileDTO } from "../mappers/auth.mapper.js";
import { findHRByIdForAuth } from "../repositories/auth.repository.js";

export const executeGetHRMe = async (hrId) => {
  const hr = await findHRByIdForAuth(hrId);

  if (!hr) {
    throw new AppError("HR profile not found.", 404);
  }

  return toHRProfileDTO(hr);
};
