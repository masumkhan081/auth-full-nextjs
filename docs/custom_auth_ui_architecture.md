# Custom Authentication System: UI Architecture & Component Guide

This document serves as a comprehensive reference for structuring the UI and frontend components of a custom, zero-third-party-library authentication system in Next.js (App Router).

## 1. High-Level Directory Structure

We will leverage Next.js App Router Route Groups `(auth)` to keep authentication routes organized without affecting the URL path. This allows us to apply specific layouts (like a centered card layout for auth pages) without impacting the rest of the application.

```text
├── app/
│   ├── (auth)/                  # Auth route group
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── layout.tsx           # Layout specific to auth pages (e.g., centered container)
│   ├── dashboard/               # Protected route example
│   │   ├── page.tsx
│   │   └── settings/page.tsx    # Where device management lives
│   ├── layout.tsx               # Root layout (TopNav goes here)
│   └── page.tsx                 # Public landing page
├── components/
│   ├── auth/                    # Auth-specific components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── DeviceSessionsList.tsx
│   └── layout/                  # Shared UI layout
│       └── TopNav.tsx
```

## 2. Priority-Wise Component Implementation Plan

### Priority 1: Core Navigation & Session State
Before building forms, you need a way to navigate and display the current user state.

#### `components/layout/TopNav.tsx`
*   **Purpose**: The main navigation bar visible across the application.
*   **Location**: Rendered in `app/layout.tsx` so it persists across page navigations.
*   **Contents**:
    *   Logo/Brand (links to `/`).
    *   **Unauthenticated State**: "Sign In" and "Sign Up" links/buttons.
    *   **Authenticated State**: User Avatar/Name, "Dashboard" link, and a "Log Out" button.
*   **Logic**: Needs to consume the user session state to conditionally render the UI.

---

### Priority 2: Primary Entry Points
The essential gates for users to enter the system.

#### `components/auth/SignInForm.tsx` & `app/(auth)/sign-in/page.tsx`
*   **Purpose**: User login interface.
*   **Location**: `app/(auth)/sign-in/page.tsx` imports and renders the form component.
*   **UI Elements**:
    *   Email/Username input field.
    *   Password input field (with toggle visibility eye icon).
    *   **"Remember Me" Checkbox**: Critical for determining token expiry (e.g., short-lived vs long-lived refresh tokens).
    *   Submit Button (with loading spinner state).
    *   "Forgot Password?" link.
    *   "Don't have an account? Sign up" link.

#### `components/auth/SignUpForm.tsx` & `app/(auth)/sign-up/page.tsx`
*   **Purpose**: New user registration.
*   **UI Elements**:
    *   Name/Username input.
    *   Email input.
    *   Password input (with strength indicator).
    *   Confirm Password input.
    *   Submit Button (with loading spinner state).
    *   "Already have an account? Sign in" link.

---

### Priority 3: Password Recovery
Crucial for user retention when credentials are forgotten.

#### `components/auth/ForgotPasswordForm.tsx` & `app/(auth)/forgot-password/page.tsx`
*   **Purpose**: Request a password reset link.
*   **UI Elements**:
    *   Email input field.
    *   Submit Button ("Send Reset Link").
    *   **Success State UI**: "If an account exists, an email has been sent." *(Security best practice: don't reveal if the email actually exists in the database).*
    *   "Back to Sign In" link.

#### `components/auth/ResetPasswordForm.tsx` & `app/(auth)/reset-password/page.tsx`
*   **Purpose**: Enter a new password using a secure, time-limited token.
*   **Location**: Reached via email link (e.g., `/reset-password?token=abc123xyz`).
*   **UI Elements**:
    *   Hidden field or hook to capture the `token` from the URL parameters.
    *   New Password input.
    *   Confirm New Password input.
    *   Submit Button ("Reset Password").
    *   **Error State UI**: Invalid/Expired Token message with a link to request a new one.

---

### Priority 4: Advanced Security & Session Management
Features for a robust, production-grade authentication system.

#### `components/auth/DeviceSessionsList.tsx`
*   **Purpose**: Allow users to see where they are logged in and revoke access.
*   **Location**: Typically placed in `app/dashboard/settings/page.tsx` or a profile modal.
*   **UI Elements**:
    *   List of active sessions (showing OS, Browser, IP, Location, Last Active time).
    *   "Current Device" badge for the active session.
    *   "Log Out" button next to individual remote sessions.
    *   **"Log Out of All Other Devices"** master button.

#### Token Refresh Mechanism (Invisible UI / Middleware)
*   **Purpose**: Silently rotate access tokens using refresh tokens.
*   **Implementation**: 
    *   **Option A (Server-side/Middleware)**: Handled entirely in Next.js `middleware.ts`. Intercepts expired access tokens, validates the HTTP-only refresh token cookie, and attaches a new access token. No UI component needed.
    *   **Option B (Client-side Axios/Fetch Interceptor)**: A wrapper around your API calls that catches `401 Unauthorized` responses, silently calls a `/api/auth/refresh` endpoint, and retries the original request.
    *   **UI Impact**: The user should never see this happening. However, if the refresh token is *also* expired, they should be hard-redirected to `/sign-in` with a toast notification: *"Your session has expired. Please log in again."*

## 3. Best Practices for the Custom UI

1.  **Form Validation**: Use a schema validation library like `zod` alongside `react-hook-form` to ensure passwords meet complexity requirements before hitting the server.
2.  **Security Feedback**: Never explicitly say "Password incorrect" or "User not found" on login. Use generic terms like "Invalid credentials" to prevent email enumeration.
3.  **Loading States**: Always disable submit buttons and show spinners while auth requests are inflight to prevent duplicate submissions.
4.  **Accessibility (a11y)**: Ensure all form inputs have proper `<label>` tags, error states are announced to screen readers, and the Top Nav is navigable via keyboard.
