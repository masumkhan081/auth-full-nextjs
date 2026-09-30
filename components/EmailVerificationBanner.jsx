"use client";
import { useState } from "react";

/**
 * EmailVerificationBanner
 *
 * Shown at the top of the page when the logged-in user has not yet
 * verified their email. Allows them to resend the verification email
 * without navigating away from the current page.
 *
 * Props:
 *   userEmail — displayed in the banner copy so the user knows where to look
 */
export default function EmailVerificationBanner({ userEmail }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();

      if (result.success) {
        setStatus("sent");
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.message || "Failed to resend email.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="w-full bg-yellow-50 border-b border-yellow-200 px-6 py-2 flex items-center justify-between gap-4 text-sm dark:bg-yellow-950/30 dark:border-yellow-800">
      <span className="text-yellow-800 dark:text-yellow-300">
        ⚠️ Your email{" "}
        <span className="font-semibold">{userEmail}</span> is not verified.
        Check your inbox, or{" "}
        {status === "sent" ? (
          <span className="text-green-700 font-medium dark:text-green-400">
            {message}
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={status === "sending"}
            className="underline font-medium text-yellow-900 hover:text-yellow-700 disabled:opacity-50 dark:text-yellow-200 dark:hover:text-yellow-100"
          >
            {status === "sending" ? "Sending..." : "resend the verification email"}
          </button>
        )}
        {status === "error" && (
          <span className="ml-2 text-red-600 dark:text-red-400">{message}</span>
        )}
      </span>
    </div>
  );
}
