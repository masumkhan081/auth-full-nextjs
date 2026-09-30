"use client";
import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { requestHandler } from "@/util/requestHandler";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      await requestHandler("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("If an account exists, a reset link will be sent.");
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
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <Input
        id="email"
        label="Email"
        type="email"
        ph="Enter your email"
        name="email"
        autoComplete="email"
        value={email}
        setValue={setEmail}
        error={error}
      />
      {message && <p className="text-sm text-green-600">{message}</p>}
      <Button
        type="submit"
        txt={isLoading ? "Sending..." : "Send reset link"}
        disabled={isLoading}
      />
      <a href="/auth/sign-in" className="text-sm text-blue-600">
        Back to sign in
      </a>
    </form>
  );
}