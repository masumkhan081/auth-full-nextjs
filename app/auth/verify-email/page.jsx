"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(result.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Email Verification</h1>

      {status === "verifying" && <p className="text-zinc-500">Verifying...</p>}
      {status === "success" && (
        <>
          <p className="text-green-600">{message}</p>
          <a href="/auth/sign-in" className="text-blue-600">Go to Sign In</a>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-red-500">{message}</p>
          <a href="/auth/sign-in" className="text-blue-600">Back to Sign In</a>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-zinc-500">Loading...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
