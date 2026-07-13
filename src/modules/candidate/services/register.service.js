import bcrypt from "bcrypt";
import { env } from "../../../config/env.js";
import AppError from "../../../utils/AppError.js";
import {
  createCandidate,
  findCandidateByEmail,
} from "../repositories/candidate.repository.js";

export const registerCandidateService = async (data) => {
  const existingUser = await findCandidateByEmail(data.email);

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    env.BCRYPT_SALT_ROUNDS
  );

  const user = await createCandidate({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });

  const { password, ...safeUser } = user;
  
  return safeUser;
};
