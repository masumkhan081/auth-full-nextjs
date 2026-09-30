import { validateForm } from "@/util/validation";
import { errorResponse, successResponse } from "@/util/apiResponse";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  generateToken,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 5 failed attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(`login:${ipAddress}`);
    if (!rateCheck.allowed) {
      const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
      return errorResponse(
        `Too many login attempts. Try again in ${retryMinutes} minute(s).`,
        429
      );
    }

    const body = await request.json();
    const validation = validateForm("signin", body);

    if (!validation.success) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const { email, password } = validation.data;
    const remember = body.remember || false;

    // Look up user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Generic error — never reveal whether the email exists or the password is wrong
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // Successful login — reset rate limit for this IP
    resetRateLimit(`login:${ipAddress}`);

    // Create session
    const rawToken = generateToken();
    const userAgent = request.headers.get("user-agent");

    await createSession(user.id, rawToken, userAgent, ipAddress, remember);
    await setSessionCookie(rawToken, remember);

    return successResponse("Login successful", {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
