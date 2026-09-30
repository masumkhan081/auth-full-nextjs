import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and, isNull, ne } from "drizzle-orm";
import { getSessionFromRequest, getSessionToken, hashToken } from "@/lib/auth";

export async function POST() {
  try {
    const result = await getSessionFromRequest();
    if (!result) {
      return errorResponse("Not authenticated", 401);
    }

    const currentToken = await getSessionToken();
    const currentTokenHash = hashToken(currentToken);

    // Revoke all sessions EXCEPT the current one
    const revoked = await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessions.userId, result.user.id),
          isNull(sessions.revokedAt),
          ne(sessions.tokenHash, currentTokenHash)
        )
      )
      .returning({ id: sessions.id });

    return successResponse(
      `Logged out of ${revoked.length} other device(s)`,
      { revokedCount: revoked.length }
    );
  } catch (error) {
    console.error("Logout all error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
