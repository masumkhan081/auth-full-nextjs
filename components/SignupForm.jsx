"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import { validateForm } from "../util/validation";
import { requestHandler } from "../util/requestHandler";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { success, data, errors: validationErrors } = validateForm("signup", {
      name,
      email,
      password,
      confirmPassword,
    });

    if (!success) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setIsLoading(true);

    try {
      await requestHandler("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      router.push("/");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-[320px] p-4 rounded-sm w-full lg:w-2/5 md:w-2/3 flex flex-col gap-3"
    >
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Sign Up
      </h1>
      <Input
        label="Username"
        type="text"
        ph="Enter your username"
        value={name}
        setValue={setName}
        error={errors.name}
      />
      <Input
        label="Email"
        type="email"
        ph="Enter your email"
        value={email}
        setValue={setEmail}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        ph="Enter your password"
        value={password}
        setValue={setPassword}
        error={errors.password}
      />
      <Input
        label="Confirm Password"
        type="password"
        ph="Confirm your password"
        value={confirmPassword}
        setValue={setConfirmPassword}
        error={errors.confirmPassword}
      />

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button
        type="submit"
        txt={isLoading ? "Creating account..." : "Sign Up"}
        disabled={isLoading}
      />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <a href="/auth/sign-in" className="text-blue-600">
          Sign in
        </a>
      </p>
    </form>
  );
}
