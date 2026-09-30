import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { getSessionFromRequest, getSessionToken, hashToken } from "@/lib/auth";

export async function GET() {
  try {
    const result = await getSessionFromRequest();
    if (!result) {
      return errorResponse("Not authenticated", 401);
    }

    // Get the current session's token hash to mark it as "current"
    const currentToken = await getSessionToken();
    const currentTokenHash = hashToken(currentToken);

    // Fetch all active sessions for this user
    const activeSessions = await db
      .select({
        id: sessions.id,
        userAgent: sessions.userAgent,
        ipAddress: sessions.ipAddress,
        createdAt: sessions.createdAt,
        expiresAt: sessions.expiresAt,
        tokenHash: sessions.tokenHash,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, result.user.id),
          gt(sessions.expiresAt, new Date()),
          isNull(sessions.revokedAt)
        )
      )
      .orderBy(sessions.createdAt);

    // Map sessions, marking the current one, and strip tokenHash from response
    const sessionList = activeSessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.tokenHash === currentTokenHash,
    }));

    return successResponse("Sessions fetched", { sessions: sessionList });
  } catch (error) {
    console.error("Sessions error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
