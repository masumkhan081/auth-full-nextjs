import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { emailVerificationTokens } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getSessionFromRequest, generateToken, hashToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    // Must be logged in to request a resend
    const result = await getSessionFromRequest();
    if (!result) {
      return errorResponse("Not authenticated", 401);
    }

    const { user } = result;

    // If already verified, nothing to do
    if (user.emailVerified) {
      return errorResponse("Your email is already verified", 400);
    }

    // Invalidate any existing unused tokens for this user (cleanup)
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(emailVerificationTokens.userId, user.id),
          isNull(emailVerificationTokens.usedAt)
        )
      );

    // Generate a fresh token (2hr expiry)
    const verifyToken = generateToken();
    const verifyTokenHash = hashToken(verifyToken);

    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      tokenHash: verifyTokenHash,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const verifyUrl = `${origin}/auth/verify-email?token=${verifyToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your email (resent)",
      text: `Click here to verify your email: ${verifyUrl}`,
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p><p>This link expires in 2 hours.</p>`,
    });

    return successResponse("Verification email resent. Check your inbox.");
  } catch (error) {
    console.error("Resend verification error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
