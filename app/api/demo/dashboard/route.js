import { errorResponse, successResponse } from "@/util/apiResponse";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  // Protect the API Route
  const session = await getSessionFromRequest();
  
  if (!session) {
    return errorResponse("Unauthorized. Please log in.", 401);
  }

  // Return mock data ONLY if session is valid
  const mockApiData = {
    apiKey: "sk_test_123456789",
    usage: "450 / 1000 requests",
    plan: "Pro Tier"
  };

  return successResponse("Dashboard data fetched", mockApiData);
}
