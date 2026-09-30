import { getSessionFromRequest } from "@/lib/auth";
import Link from "next/link";

// This is a Server Component (default in Next.js App Router)
export default async function ServerProtectedPage() {
  // HOW TO READ SESSION IN A SERVER COMPONENT:
  // Since we are on the server, we can directly read the HttpOnly cookie 
  // and query the database without any extra API calls!
  const session = await getSessionFromRequest();

  // Note: We don't technically need this redirect check here if middleware.js 
  // is protecting this route, but it's good practice for defense-in-depth.
  if (!session) {
    return (
      <div className="p-8 text-center text-red-500">
        You should not be able to see this because middleware should have redirected you!
      </div>
    );
  }

  // Fetch some mock secure data directly on the server
  const mockOrders = [
    { id: "ORD-001", item: "Mechanical Keyboard", total: "$120.00", status: "Shipped" },
    { id: "ORD-002", item: "Wireless Mouse", total: "$45.00", status: "Processing" },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Protected Server Page</h1>
      <p className="text-zinc-600 mb-8">
        Welcome back, <span className="font-semibold text-blue-600">{session.user.name}</span>! 
        This page was rendered entirely on the server. There was zero loading state and zero flashing because the server read your cookie before sending the HTML to the browser.
      </p>

      <div className="bg-white border rounded-md p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Recent Orders (Server Fetched)</h2>
        <ul className="space-y-3">
          {mockOrders.map(order => (
            <li key={order.id} className="flex justify-between border-b pb-2">
              <span>{order.item} <span className="text-sm text-zinc-500">({order.id})</span></span>
              <span className="font-medium">{order.total} - {order.status}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Server Components use <Link> for navigation — onClick cannot cross the server-client boundary */}
      <div className="mt-8">
        <Link href="/" className="text-blue-600 underline text-sm">← Go Home</Link>
      </div>
    </div>
  );
}
