import Link from "next/link";

export default function ServerPublicPage() {
  const mockProducts = [
    { id: "PROD-1", name: "Next.js Authentication Masterclass", price: "Free" },
    { id: "PROD-2", name: "Advanced React Patterns", price: "$49.99" },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Public Server Page</h1>
      <p className="text-zinc-600 mb-8">
        Anyone can view this page, whether they are logged in or not. It renders instantly on the server.
      </p>

      <div className="bg-white border rounded-md p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Public Products</h2>
        <ul className="space-y-3">
          {mockProducts.map(prod => (
            <li key={prod.id} className="flex justify-between border-b pb-2">
              <span>{prod.name}</span>
              <span className="font-medium text-green-600">{prod.price}</span>
            </li>
          ))}
        </ul>
      </div>

      {/*
        WHY <Link> and NOT <Button onClick>:
        Server Components cannot pass event handler functions (like onClick) as props
        to any component — functions cannot be serialized across the server-client boundary.
        Next.js <Link> is the correct, server-safe way to handle navigation here.
      */}
      <div className="mt-8">
        <Link href="/" className="text-blue-600 underline text-sm">← Go Home</Link>
      </div>
    </div>
  );
}
