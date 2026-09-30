"use client";
import React, { useState, useEffect } from "react";
import Button from "./Button";
import EmailVerificationBanner from "./EmailVerificationBanner";

export default function TopNav() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setUser(result.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/auth/sign-in";
  };

  return (
    // Wrapping div so the banner can sit flush above the nav bar
    <div className="w-full flex flex-col">
      {/* Email verification banner — only shown to logged-in unverified users */}
      {!loading && user && !user.emailVerified && (
        <EmailVerificationBanner userEmail={user.email} />
      )}

      <div className="shadow-sm w-full flex justify-between px-6 py-2">
        <Button
          txt="Auth-Full-NextJS"
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <div className="flex gap-4 justify-end items-center">
          {loading ? null : user ? (
            <>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.name}
              </span>
              <Button
                type="link"
                txt="Profile"
                onClick={() => {
                  window.location.href = "/profile";
                }}
              />
              <Button txt="Log Out" onClick={handleLogout} />
            </>
          ) : (
            <>
              <Button
                type="link"
                txt="Sign In"
                onClick={() => {
                  window.location.href = "/auth/sign-in";
                }}
              />
              <Button
                type="link"
                txt="Sign Up"
                onClick={() => {
                  window.location.href = "/auth/sign-up";
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
