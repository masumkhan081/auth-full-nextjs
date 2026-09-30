import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hashToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return errorResponse("Token is required", 400);
    }

    const tokenHash = hashToken(token);

    // Find the verification token
    const [record] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          gt(emailVerificationTokens.expiresAt, new Date()),
          isNull(emailVerificationTokens.usedAt)
        )
      )
      .limit(1);

    if (!record) {
      return errorResponse("Invalid or expired verification link", 400);
    }

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, record.id));

    // Mark user email as verified
    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, record.userId));

    return successResponse("Email verified successfully");
  } catch (error) {
    console.error("Verify email error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
