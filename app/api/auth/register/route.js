import { validateForm } from "@/util/validation";
import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  generateToken,
  hashToken,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = validateForm("signup", body);

    if (!validation.success) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return errorResponse("An account with this email already exists", 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      });

    // Create session
    const rawToken = generateToken();
    const userAgent = request.headers.get("user-agent");
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    await createSession(newUser.id, rawToken, userAgent, ipAddress, false);
    await setSessionCookie(rawToken, false);

    // Generate email verification token and send email
    const verifyToken = generateToken();
    const verifyTokenHash = hashToken(verifyToken);

    await db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      tokenHash: verifyTokenHash,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    const verifyUrl = `${request.headers.get("origin") || "http://localhost:3000"}/auth/verify-email?token=${verifyToken}`;

    // Fire and forget — don't block registration if email fails
    sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Click here to verify your email: ${verifyUrl}`,
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p><p>This link expires in 2 hours.</p>`,
    }).catch((err) => console.error("Failed to send verification email:", err));

    return successResponse("Account created successfully", newUser, 201);
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
