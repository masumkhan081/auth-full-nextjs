import { errorResponse, successResponse } from "@/util/apiResponse";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request) {
  // DATA-LEVEL PROTECTION:
  // Even if the page requesting this data is protected, this API route 
  // must independently verify the session cookie to remain secure.
  const session = await getSessionFromRequest();
  
  if (!session) {
    return errorResponse("API Access Denied: Missing or invalid session cookie.", 401);
  }

  // If authenticated, return the secure data
  const mockOrders = [
    { id: "ORD-901", item: "4K Monitor", total: "$350.00", status: "Delivered" },
    { id: "ORD-902", item: "Ergonomic Chair", total: "$199.00", status: "In Transit" },
    { id: "ORD-903", item: "Mechanical Switch Tester", total: "$15.00", status: "Processing" },
  ];

  return successResponse("Orders fetched securely", mockOrders);
}
