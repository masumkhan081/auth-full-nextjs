"use client";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { requestHandler } from "@/util/requestHandler";

export default function ClientProtectedPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // HOW TO FETCH PROTECTED DATA IN A CLIENT COMPONENT:
    // We cannot read the HttpOnly cookie directly in JavaScript.
    // Instead, we just make a standard fetch request to a protected API.
    // The browser will automatically attach the HttpOnly cookie to the request!
    const fetchDashboard = async () => {
      try {
        const result = await requestHandler("/api/demo/dashboard");
        setData(result.data);
      } catch (err) {
        // If the API returns 401 Unauthorized, we catch it here.
        // NOTE: If middleware.js is active on this page, this catch block 
        // rarely runs because middleware redirects the user before the page even loads.
        setError(err.message);
        window.location.href = "/auth/sign-in"; 
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-64 bg-zinc-200 rounded"></div>
          <div className="h-4 w-96 bg-zinc-200 rounded"></div>
          <div className="h-32 w-full max-w-2xl bg-zinc-200 rounded mt-8"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Protected Client Page</h1>
      <p className="text-zinc-600 mb-8">
        This is a traditional Client Component (`"use client"`). It loaded a blank skeleton first, then the browser automatically sent your HttpOnly cookie to the `/api/demo/dashboard` route to fetch this private data.
      </p>

      <div className="bg-zinc-950 text-green-400 p-6 rounded-md font-mono text-sm">
        <p>// Fetched Secure Data:</p>
        <p>API Key: {data.apiKey}</p>
        <p>Usage: {data.usage}</p>
        <p>Plan: {data.plan}</p>
      </div>

      <div className="mt-8">
        <Button type="link" txt="Go Home" onClick={() => window.location.href = "/"} />
      </div>
    </div>
  );
}
