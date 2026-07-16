import { findHRByEmailForAuth, storeResetToken } from "../repositories/auth.repository.js";
import { generatePasswordResetToken } from "../../../../utils/crypto.js";

export const executeHRForgotPassword = async (email) => {
  const hr = await findHRByEmailForAuth(email);
  
  // We do not throw an error if HR is not found, to prevent email enumeration.
  if (hr && hr.isActive && hr.status === "ACTIVE") {
    const { plainToken, hashedToken, expiresAt } = generatePasswordResetToken();
    
    await storeResetToken(hr.id, hashedToken, expiresAt);
    
    // TODO: Integrate Notification Module to send `plainToken` to `email`.
    // For now, in this sprint, we just log it (in a real production app, never log tokens).
    console.log(`[DEV ONLY] Password reset token for ${email}: ${plainToken}`);
  }

  return { message: "If the account exists, password reset instructions have been sent." };
};
