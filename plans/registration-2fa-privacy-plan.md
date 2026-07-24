# Registration + 2FA + Privacy — Frontend Implementation Plan

## Overview

This plan outlines the frontend-only implementation for Epic 1: Registration + 2FA + Privacy. No backend integration, no database work, no real authentication logic. All data and interactions are mocked on the frontend.

The goal is to extend the existing registration flow with email verification, 2FA setup, and privacy onboarding, then also add 2FA management to the existing Settings page.

---

## 1. Current State Analysis

### Existing Pages

| Page | File | Purpose |
|------|------|---------|
| Registration | `app/register/page.tsx` | Form: first name, last name, email, password, household size, terms. On submit → redirects to `/dashboard`. |
| Login | `app/login/page.tsx` | Form: email, password, remember me. On submit → redirects to `/dashboard`. |
| Settings | `app/(app)/settings/page.tsx` | Tabs: Profile (avatar, name, email, household), Privacy (toggle switches), Notifications (not yet built), Security (password change). |
| App Layout | `app/(app)/layout.tsx` | Authenticated shell with sidebar nav, top header, breadcrumbs. |
| Landing | `app/page.tsx` | Public page with Navbar, Hero, Features, How It Works, Benefits, Footer. |

### Design System (from existing code)

- **Primary Color**: `#4CAF50` (green) with hover variant `#3d8c40`
- **Background**: `bg-gray-50` for page, `bg-white` for cards
- **Cards**: `rounded-2xl border border-gray-200 shadow-sm p-8`
- **Inputs**: `h-11 px-4 rounded-xl border bg-gray-50 text-sm`, focus ring `#4CAF50`
- **Buttons**: Green filled (`bg-[#4CAF50] text-white font-semibold py-3 rounded-xl`) or ghost
- **Typography**: `font-sans` (Geist), heading `font-bold text-2xl`, body `text-sm text-gray-500`
- **Spacing**: Consistent use of `space-y-5`, `gap-4`, `p-6`, `px-6 py-16`
- **Icons**: lucide-react
- **Animation**: `framer-motion` available in dependencies

---

## 2. Proposed Architecture — Registration Flow

### Flow Diagram

```
[Registration Form] ──submit──► [Email Verification] ──verify──► [2FA Setup] ──configured──► [Privacy Onboarding] ──save──► [/dashboard]
       │                              │                            │
       │  (modified to NOT            │  (mock email with          │  (mock QR code +
       │   redirect to dashboard)     │   6-digit OTP input)       │   OTP confirmation)
       ▼                              ▼                            ▼
```

### File Structure (new/modified)

```
app/register/
  page.tsx                          # MODIFIED: change submit to redirect → /register/verify-email
  verify-email/
    page.tsx                        # NEW: email verification with OTP input
  2fa-setup/
    page.tsx                        # NEW: 2FA setup with mock QR + secret key + OTP confirm
  privacy/
    page.tsx                        # NEW: privacy preferences onboarding

app/(app)/settings/page.tsx         # MODIFIED: add 2FA management section under Security tab
```

### Modified Registration Page (`app/register/page.tsx`)

**Change**: On successful form submission, instead of redirecting to `/dashboard`, redirect to `/register/verify-email`.

```ts
// Before
window.location.href = "/dashboard";

// After
window.location.href = "/register/verify-email";
```

**No other changes** to the registration form — all existing fields, validation, styling remain identical.

---

## 3. Page Specifications

### 3.1 Email Verification (`/register/verify-email`)

**Purpose**: Show the user that an email has been sent and let them enter a mock 6-digit OTP to verify their email address.

**Layout** (matches existing registration card layout):
- Centered card on `bg-gray-50` page
- SavePlate logo + link to home
- Title: "Verify Your Email"
- Subtitle: "We sent a verification code to [email]"
- 6 individual OTP input fields (digit boxes)
- "Verify Email" button
- "Resend code" link with countdown mock
- Link back to registration if email was wrong

**Mock Behavior**:
- Any 6-digit code is accepted after a simulated 800ms delay
- On success, redirect to `/register/2fa-setup`
- Resend shows a simulated "Code resent!" toast

**States**: loading (spinner), error (invalid code), success (redirect)

### 3.2 2FA Setup (`/register/2fa-setup`)

**Purpose**: Let the user set up two-factor authentication with an authenticator app (mocked).

**Layout**:
- Same centered card layout
- Title: "Set Up Two-Factor Authentication"
- Subtitle: "Scan this QR code with your authenticator app"
- Mock QR code placeholder (a styled `div` with a grid pattern, not a real QR)
- Secret key display (e.g., `JBSWY3DPEHPK3PXP`) with copy button
- OTP confirmation input (6 digits) to verify setup
- "Verify & Continue" button
- "Skip for now" link

**Mock Behavior**:
- Accepts any 6-digit code
- On success, redirect to `/register/privacy`
- Skip → redirect to `/register/privacy`

**States**: loading, error, success

### 3.3 Privacy Onboarding (`/register/privacy`)

**Purpose**: Let the user configure their privacy preferences during onboarding.

**Layout**:
- Same centered card layout
- Title: "Privacy Preferences"
- Subtitle: "Control your visibility on SavePlate"
- List of toggle switches (reusing same toggle style from Settings page):
  - "Public Profile" — Allow others to see your profile
  - "Show Donation History" — Display your past donations publicly
  - "Receive Marketing Emails" — Tips and updates about food waste
  - "Share Impact Stats" — Let others see your sustainability impact
- "Save & Continue" button

**Mock Behavior**:
- Simulates saving preferences (800ms delay)
- On success, redirect to `/dashboard`

---

## 4. Settings Page Enhancement

### 4.1 2FA Management in Security Section

Add a new subsection "Two-Factor Authentication" to the existing Security section in `app/(app)/settings/page.tsx`.

**When 2FA is disabled**:
- Show current status: "Two-factor authentication is disabled"
- "Enable 2FA" button → opens inline setup flow or redirects to `/register/2fa-setup`
- For simplicity, we add an inline expandable section within the Security tab

**When 2FA is enabled** (mocked as initially disabled):
- Show status: "Two-factor authentication is active"
- "Disable 2FA" button with confirmation
- "Regenerate Recovery Codes" option

**Implementation approach**: Add a collapsible section within the Security card that contains:
- 2FA status indicator
- Enable/Disable toggle button
- When enabling, show a simplified inline version with mock QR and OTP confirmation

---

## 5. Component Reuse Strategy

| Requirement | Reuses From |
|-------------|-------------|
| Card layout | Registration page (`bg-white rounded-2xl border border-gray-200 shadow-sm p-8`) |
| Input fields | Registration page styled inputs |
| Buttons | Registration page (`bg-[#4CAF50] text-white font-semibold py-3 rounded-xl`) |
| Toggle switches | Settings page Privacy section toggle |
| Loading spinner | Registration page (`svg animate-spin...`) |
| Error/success alerts | Registration page (`bg-red-50 border-red-200...`) / Settings page (`bg-[#E8F5E9] border-[#4CAF50]/30`) |
| OTP input | New component, but styled consistently |

---

## 6. Implementation Order

1. **Modify registration page** — Change redirect target from `/dashboard` to `/register/verify-email`
2. **Create email verification page** — `/register/verify-email/page.tsx`
3. **Create 2FA setup page** — `/register/2fa-setup/page.tsx`
4. **Create privacy onboarding page** — `/register/privacy/page.tsx`
5. **Enhance settings page** — Add 2FA management to Security section

---

## 7. Success Criteria

- User can register, see email verification, enter OTP, set up 2FA, configure privacy, and land on dashboard
- All new pages match the existing design language exactly
- Settings page has 2FA management working with mock data
- No existing functionality is broken
- No backend/database calls are introduced
- All interactions are mocked with simulated delays
