import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, hashToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse("Email is required", 400);
    }

    // Always return the same message regardless of whether the user exists
    // This prevents email enumeration attacks
    const genericMessage =
      "If an account with that email exists, a password reset link has been sent.";

    const [user] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Don't reveal that the user doesn't exist
      return successResponse(genericMessage);
    }

    // Generate reset token (expires in 15 minutes)
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    const resetUrl = `${request.headers.get("origin") || "http://localhost:3000"}/auth/reset-password?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      text: `Click here to reset your password: ${resetUrl}\n\nThis link expires in 15 minutes.`,
      html: `<p>Hi ${user.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
    });

    return successResponse(genericMessage);
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
