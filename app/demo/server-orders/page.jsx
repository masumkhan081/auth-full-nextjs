import { cookies, headers } from "next/headers";
import { getSessionFromRequest } from "@/lib/auth";
import Link from "next/link";

export default async function ServerOrdersPage() {
  // 1. PAGE-LEVEL PROTECTION
  // We read the session directly on the server to protect the page render itself.
  // (Note: middleware.js is also protecting this route at the edge).
  const session = await getSessionFromRequest();

  if (!session) {
    return <div className="p-8 text-center text-red-500">Page Access Denied</div>;
  }

  // 2. DATA-LEVEL PROTECTION (Fetching a protected API from a Server Component)
  // CRITICAL ARCHITECTURE NOTE:
  // When a Server Component makes a fetch() call, it acts as an independent client. 
  // It does NOT automatically forward the user's cookies to the API.
  // If we just do fetch("/api/demo/orders"), the API will reject us with 401 Unauthorized!
  // We MUST manually extract the cookie from the incoming request and attach it to our outgoing fetch headers.

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_token");
  
  // In Next.js Server Components, internal fetch calls require an absolute URL
  const host = (await headers()).get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  let orders = [];
  let apiError = null;

  try {
    const res = await fetch(`${protocol}://${host}/api/demo/orders`, {
      method: "GET",
      // WE MANUALLY PASS THE COOKIE TO THE API TO PROVE WHO WE ARE!
      headers: {
        Cookie: `session_token=${sessionCookie?.value}`,
      },
      cache: "no-store", // Ensure we always fetch fresh data for authenticated routes
    });

    const result = await res.json();

    if (result.success) {
      orders = result.data;
    } else {
      apiError = result.message;
    }
  } catch (error) {
    apiError = "Failed to reach the API layer.";
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Protected Server + Protected API</h1>
      <p className="text-zinc-600 mb-8">
        Hello <span className="font-semibold text-blue-600">{session.user.name}</span>. 
        This page passed <strong>Page-Level protection</strong>. Then, the server securely passed your HttpOnly cookie to the `/api/demo/orders` route to pass <strong>Data-Level protection</strong>.
      </p>

      <div className="bg-white border rounded-md p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Orders (API Fetched)</h2>
        
        {apiError ? (
          <p className="text-red-500 bg-red-50 p-3 rounded">API Error: {apiError}</p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id} className="flex justify-between border-b pb-2">
                <span>{order.item} <span className="text-sm text-zinc-500">({order.id})</span></span>
                <span className="font-medium text-green-700">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Server Components use <Link> for navigation — onClick cannot cross the server-client boundary */}
      <div className="mt-8">
        <Link href="/" className="text-blue-600 underline text-sm">← Go Home</Link>
      </div>
    </div>
  );
}
