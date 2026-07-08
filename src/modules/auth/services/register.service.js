import bcrypt from "bcrypt";
import { env } from "../../../config/env.js";
import AppError from "../../../utils/AppError.js";
import { createAccessToken } from "../utils/authToken.util.js";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

export const registerService = async (data) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    env.BCRYPT_SALT_ROUNDS
  );

  const user = await createUser({
    ...data,
    password: hashedPassword,
  });

  const accessToken = createAccessToken(user);

  return {
    user,
    accessToken,
  };
};