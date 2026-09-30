import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getSessionFromRequest, getSessionToken, hashToken } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try {
    const result = await getSessionFromRequest();
    if (!result) {
      return errorResponse("Not authenticated", 401);
    }

    const { sessionId } = await params;

    // Prevent revoking the current session via this endpoint (use /logout for that)
    const currentToken = await getSessionToken();
    const currentTokenHash = hashToken(currentToken);

    // Find the target session — must belong to this user
    const [targetSession] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, result.user.id),
          isNull(sessions.revokedAt)
        )
      )
      .limit(1);

    if (!targetSession) {
      return errorResponse("Session not found", 404);
    }

    if (targetSession.tokenHash === currentTokenHash) {
      return errorResponse("Cannot revoke the current session. Use logout instead.", 400);
    }

    // Revoke the session
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));

    return successResponse("Session revoked", { sessionId });
  } catch (error) {
    console.error("Revoke session error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
