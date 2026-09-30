"use client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { requestHandler } from "@/util/requestHandler";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <h1 className="text-2xl font-semibold">Invalid Link</h1>
        <p className="text-red-500">No reset token found in the URL.</p>
        <a href="/auth/forgot-password" className="text-blue-600">
          Request a new reset link
        </a>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestHandler("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-[320px] p-4 rounded-sm w-full lg:w-2/5 md:w-2/3 flex flex-col gap-3"
    >
      <h1 className="text-2xl font-semibold">Reset Password</h1>

      <Input
        label="New Password"
        type="password"
        ph="Enter new password"
        value={password}
        setValue={setPassword}
      />
      <Input
        label="Confirm Password"
        type="password"
        ph="Confirm new password"
        value={confirmPassword}
        setValue={setConfirmPassword}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && (
        <div>
          <p className="text-sm text-green-600">{message}</p>
          <a href="/auth/sign-in" className="text-sm text-blue-600">
            Go to Sign In
          </a>
        </div>
      )}

      <Button
        type="submit"
        txt={isLoading ? "Resetting..." : "Reset Password"}
        disabled={isLoading}
      />
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Suspense fallback={<p className="p-8 text-zinc-500">Loading...</p>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
