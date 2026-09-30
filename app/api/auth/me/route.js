import { errorResponse, successResponse } from "@/util/apiResponse";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const result = await getSessionFromRequest();

    if (!result) {
      return errorResponse("Not authenticated", 401);
    }

    return successResponse("Authenticated", result.user);
  } catch (error) {
    console.error("Me error:", error);
    return errorResponse("Something went wrong", 500);
  }
}
