"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemas } from "../schemas/validation.schema";
import { requestHandler } from "../util/requestHandler";

// Shadcn UI Components
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

export default function SigninForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemas.signin),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setIsLoading(true);

    try {
      await requestHandler("/api/auth/login", {
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
      onSubmit={handleSubmit(onSubmit)}
      className="min-w-[320px] p-6 rounded-md border border-zinc-200 bg-white w-full lg:w-2/5 md:w-2/3 flex flex-col gap-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Reference form: React Hook Form + shadcn
        </p>
      </div>

      {/* UNCONTROLLED COMPONENT (Email) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          {...register("email")} /* <-- register() binds the uncontrolled input */
        />
        {errors.email && (
          <p className="text-xs text-red-500 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* UNCONTROLLED COMPONENT (Password) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-500 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* CONTROLLED COMPONENT (Remember Me) */}
        {/* Shadcn's Checkbox requires a Controller because it's a Radix-based custom element, not a native <input type="checkbox"> */}
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remember me
              </Label>
            </div>
          )}
        />

        <a href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      {serverError && <p className="text-sm text-red-500 font-medium">{serverError}</p>}

      <Button type="submit" disabled={isLoading} className="w-full mt-2">
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mt-2">
        Don&apos;t have an account?{" "}
        <a href="/auth/sign-up" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
