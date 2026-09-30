import { errorResponse, successResponse } from "@/util/apiResponse";
import { getSessionToken, revokeSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getSessionToken();

    if (!token) {
      return errorResponse("Not authenticated", 401);
    }

    await revokeSession(token);
    await clearSessionCookie();

    return successResponse("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
