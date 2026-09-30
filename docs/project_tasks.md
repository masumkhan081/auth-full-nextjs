# Auth System Implementation Tasks

## Pre-Implementation: Bug Fixes
- [x] Fix `db/index.js` — remove TS non-null assertion `!`
- [x] Fix `app/api/auth/sessions/[sessionId]/route.js` — strip TS syntax
- [x] Fix `drizzle.config.js` — schema path `.ts` → `.js`
- [x] Fix `jsconfig.json` — remove TS include patterns
- [x] Clean `package.json` — remove unused `@neondatabase/serverless`
- [x] Install `bcryptjs`

## Section 0: Shared Auth Utilities
- [x] Create `lib/auth.js` — password hashing, token generation, session CRUD, cookie helpers
- [x] Create `lib/email.js` — reusable email sender (extract from test-email route)

## Section 1: Registration & Login
- [x] Implement `app/api/auth/register/route.js`
- [x] Implement `app/api/auth/login/route.js`
- [x] Implement `app/api/auth/me/route.js`
- [x] Implement `app/api/auth/logout/route.js`
- [x] Wire up `components/SignupForm.jsx` to call register API
- [x] Update `components/TopNav.jsx` to be session-aware

## Section 2: Email Verification
- [x] Implement `app/api/auth/verify-email/route.js`
- [x] Create `app/auth/verify-email/page.jsx`

## Section 3: Password Recovery
- [x] Implement `app/api/auth/forgot-password/route.js`
- [x] Implement `app/api/auth/reset-password/route.js`
- [x] Implement `app/api/auth/change-password/route.js`
- [x] Create `app/auth/reset-password/page.jsx`

## Section 4: Brute-Force Protection
- [x] Create `lib/rateLimit.js`
- [x] Integrate rate limiting into login route

## Section 5: Multi-Device Session Control
- [x] Implement `app/api/auth/sessions/route.js` (GET — list sessions)
- [x] Implement `app/api/auth/sessions/[sessionId]/route.js` (DELETE — revoke one)
- [x] Implement `app/api/auth/logout-all/route.js` (revoke all others)
- [x] Create `app/auth/sessions/page.jsx` (manage sessions UI)

## Section 6: Edge Protection
- [x] Create `middleware.js` at project root

## Bonus: shadcn + RHF Reference Form
- [x] Install shadcn/ui and 1–2 components
- [x] Upgrade `components/SigninForm.jsx` to use shadcn components with RHF as a reference sample

---

# Phase 2: Next Session (Advanced Auth & Identity)

When you resume work, start here. The architectural mental model for these features is already documented in `docs/auth_architecture_mental_model.md`.

## Part 1: Social Auth & Account Linking (Google)
- [ ] Create `oauth_accounts` table in `db/schema.js` (`id`, `user_id`, `provider`, `provider_user_id`).
- [ ] Implement Google OAuth login route (`/api/auth/google`).
- [ ] Implement Google OAuth callback route (`/api/auth/callback/google`) with logic to auto-merge if email exists.
- [ ] Create `/profile/settings` UI page.
- [ ] Add "Connect Google" and "Disconnect Google" buttons to the settings page.
- [ ] Implement API routes to explicitly link/unlink a provider while logged in.

## Part 2: Authorization (RBAC)
- [ ] Expand DB schema: Create `roles`, `permissions`, `role_permissions`, and `user_roles` tables.
- [ ] Implement "Super Admin" dashboard (`/admin/users`) to view all users.
- [ ] Add ability for Super Admin to manually assign roles to other users from the dashboard.
- [ ] Implement a Role Builder UI (`/admin/roles`) to create custom roles and assign specific permissions.
- [ ] Update `middleware.js` to protect `/admin` routes based on user role.
- [ ] Create a permission utility (e.g., `user.hasPermission('delete_order')`) to guard API routes and UI buttons.
