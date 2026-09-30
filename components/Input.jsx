import React, { useState } from "react";
import { Eye, EyeOff } from "@deemlol/next-icons";

export default function Input({
  label,
  type,
  ph,
  value,
  setValue = (value) => {},
  registration,
  name,
  error,
  id,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          {...registration}
          type={inputType}
          id={id}
          {...(name === undefined ? {} : { name })}
          {...(value === undefined
            ? {}
            : {
                value: value ?? "",
                onChange: (e) => setValue(e.target.value),
              })}
          placeholder={ph}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-md border bg-transparent py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-zinc-300"
          } ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
