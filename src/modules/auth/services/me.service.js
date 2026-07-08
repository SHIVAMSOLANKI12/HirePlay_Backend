import AppError from "../../../utils/AppError.js";
import { findUserById } from "../repositories/user.repository.js";

export const getMeService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
