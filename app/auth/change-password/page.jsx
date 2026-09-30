"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { requestHandler } from "@/util/requestHandler";

// Zod schema defined inline — this page has no shared schema,
// it's specific to this form only
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export default function ChangePasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = await requestHandler("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccessMessage(result.message);
      reset(); // Clear the form fields on success
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-16 h-full w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-[320px] p-6 rounded-md border border-zinc-200 bg-white w-full lg:w-2/5 md:w-2/3 flex flex-col gap-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Change Password</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Enter your current password, then choose a new one.
          </p>
        </div>

        {/* Using RHF register() via the custom Input's `registration` prop.
            Input.jsx spreads `registration` onto the underlying <input> element,
            which gives RHF the ref it needs to track the field without forwardRef. */}
        <Input
          label="Current Password"
          type="password"
          ph="Enter current password"
          registration={register("currentPassword")}
          error={errors.currentPassword?.message}
        />

        <Input
          label="New Password"
          type="password"
          ph="Enter new password"
          registration={register("newPassword")}
          error={errors.newPassword?.message}
        />

        <Input
          label="Confirm New Password"
          type="password"
          ph="Confirm new password"
          registration={register("confirmNewPassword")}
          error={errors.confirmNewPassword?.message}
        />

        {serverError && (
          <p className="text-sm text-red-500 font-medium">{serverError}</p>
        )}

        {successMessage && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-green-600 font-medium">{successMessage}</p>
            <p className="text-xs text-zinc-500">
              Other devices have been signed out for security. You are still logged in here.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button
            type="submit"
            txt={isLoading ? "Updating..." : "Update Password"}
            disabled={isLoading}
          />
          <Button
            type="link"
            txt="Cancel"
            onClick={() => router.back()}
          />
        </div>
      </form>
    </div>
  );
}
