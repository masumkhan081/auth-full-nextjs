import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "session_token";

// ─── Password Hashing ───────────────────────────────────────────────

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// ─── Token Generation ───────────────────────────────────────────────
// We generate a random token, send the raw token to the client (via cookie or email link),
// but only store a SHA-256 hash in the database. This way, even if the DB is compromised,
// the attacker cannot reconstruct valid session tokens.

export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ─── Session Management ─────────────────────────────────────────────

export const createSession = async (userId, rawToken, userAgent, ipAddress, rememberMe = false) => {
  const tokenHash = hashToken(rawToken);

  // rememberMe: 30 days, otherwise: 24 hours
  const expiresAt = new Date(
    Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
  );

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      tokenHash,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
    })
    .returning();

  return session;
};

export const validateSession = async (rawToken) => {
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const result = await db
    .select({
      session: sessions,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        isNull(sessions.revokedAt)
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  return { session: result[0].session, user: result[0].user };
};

export const revokeSession = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.tokenHash, tokenHash));
};

// ─── Cookie Helpers ─────────────────────────────────────────────────

export const setSessionCookie = async (rawToken, rememberMe = false) => {
  const cookieStore = await cookies();

  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
};

export const clearSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

export const getSessionFromRequest = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return validateSession(token);
};

export const getSessionToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
};
