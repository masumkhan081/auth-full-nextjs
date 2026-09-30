import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/profile",
  "/auth/sessions",
  "/auth/change-password",
  "/demo/server-protected",
  "/demo/client-protected",
  "/demo/server-orders"
];

// Routes that should NOT be accessible when already logged in
const authRoutes = ["/auth/sign-in", "/auth/sign-up"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  // If accessing a protected route without a session cookie → redirect to sign-in
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !sessionToken) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing an auth route with a session cookie → redirect to home
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/auth/:path*", "/demo/:path*"],
};
