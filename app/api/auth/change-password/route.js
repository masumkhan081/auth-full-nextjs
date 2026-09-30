import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, isNull, ne } from "drizzle-orm";
import {
  getSessionFromRequest,
  getSessionToken,
  hashToken,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";

export async function POST(request) {
  try {
    // Must be authenticated
    const result = await getSessionFromRequest();
    if (!result) {
      return errorResponse("Not authenticated", 401);
    }

    const { currentPassword, newPassword, confirmNewPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return errorResponse("All fields are required", 400);
    }

    if (newPassword !== confirmNewPassword) {
      return errorResponse("New passwords do not match", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    // Fetch full user (with passwordHash)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, result.user.id))
      .limit(1);

    const passwordMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return errorResponse("Current password is incorrect", 400);
    }

    // Hash new password and update
    const newHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // Revoke all OTHER sessions (keep the current one active)
    const currentToken = await getSessionToken();
    const currentTokenHash = hashToken(currentToken);

    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessions.userId, user.id),
          isNull(sessions.revokedAt),
          ne(sessions.tokenHash, currentTokenHash)
        )
      );

    return successResponse("Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
