import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { users, passwordResetTokens, sessions } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hashToken, hashPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) {
      return errorResponse("All fields are required", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse("Passwords do not match", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    const tokenHash = hashToken(token);

    // Find the reset token
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!record) {
      return errorResponse("Invalid or expired reset link", 400);
    }

    // Hash new password and update user
    const newHash = await hashPassword(password);

    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, record.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));

    // Revoke all existing sessions for this user (force re-login on all devices)
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessions.userId, record.userId),
          isNull(sessions.revokedAt)
        )
      );

    return successResponse("Password reset successfully. Please sign in with your new password.");
  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
