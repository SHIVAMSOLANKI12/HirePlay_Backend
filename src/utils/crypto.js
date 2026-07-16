import crypto from "crypto";

export const generatePasswordResetToken = () => {
  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  return { plainToken, hashedToken, expiresAt };
};
