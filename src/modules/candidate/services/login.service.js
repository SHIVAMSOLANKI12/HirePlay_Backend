import bcrypt from "bcrypt";
import AppError from "../../../utils/AppError.js";
import { findCandidateByEmail } from "../repositories/candidate.repository.js";
import { createRefreshToken } from "../../auth/repositories/auth.repository.js";
import {
  createAccessToken,
  createRefreshJwt,
  getRefreshTokenExpiry,
} from "../../auth/utils/authToken.util.js";

export const loginCandidateService = async (data) => {
  const user = await findCandidateByEmail(data.email);

  if (!user || user.role !== "CANDIDATE") {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshJwt(user);

  await createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt: getRefreshTokenExpiry(),
  });

  const { password, ...safeUser } = user;

  return {
    candidate: safeUser,
    accessToken,
    refreshToken,
  };
};
