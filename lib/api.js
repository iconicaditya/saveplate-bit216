/**
 * API helper for communicating with the SavePlate backend server.
 * All auth-related API calls go through this module.
 */

const API_BASE_URL = '/api';

/**
 * Get the stored auth token from localStorage
 */
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('saveplate_token');
}

/**
 * Store the auth token
 */
function setToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('saveplate_token', token);
  }
}

/**
 * Remove the auth token (logout)
 */
function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('saveplate_token');
  }
}

/**
 * Get the stored user data from localStorage
 */
function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('saveplate_user');
  return data ? JSON.parse(data) : null;
}

/**
 * Store user data
 */
function setStoredUser(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('saveplate_user', JSON.stringify(user));
  }
}

/**
 * Clear all auth data
 */
function clearAuth() {
  clearToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('saveplate_user');
  }
}

/**
 * Generic fetch wrapper with auth header
 */
async function apiFetch(endpoint, options = {}) {
  const { body, method = 'GET', requiresAuth = false } = options;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred.');
  }

  return data;
}

// ─── Auth API Methods ───────────────────────────────────────────

/**
 * Register a new user
 */
export async function registerUser({ firstName, lastName, email, password, householdSize }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: { firstName, lastName, email, password, householdSize },
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

/**
 * Verify email with OTP
 */
export async function verifyEmail(email, otp) {
  const data = await apiFetch('/auth/verify-email', {
    method: 'POST',
    body: { email, otp },
  });
  // Update stored user with verified status
  const stored = getStoredUser();
  if (stored) {
    setStoredUser({ ...stored, emailVerified: true });
  }
  return data;
}

/**
 * Resend verification code
 */
export async function resendVerification(email) {
  return apiFetch('/auth/resend-verification', {
    method: 'POST',
    body: { email },
  });
}

/**
 * Setup 2FA (generate secret + QR code)
 */
export async function setup2FA() {
  return apiFetch('/auth/2fa/setup', {
    method: 'POST',
    requiresAuth: true,
  });
}

/**
 * Verify and enable 2FA
 */
export async function verify2FA(otp) {
  const data = await apiFetch('/auth/2fa/verify', {
    method: 'POST',
    body: { otp },
    requiresAuth: true,
  });
  // Update stored user
  const stored = getStoredUser();
  if (stored) {
    setStoredUser({ ...stored, twoFAEnabled: true });
  }
  return data;
}

/**
 * Disable 2FA
 */
export async function disable2FA(password) {
  const data = await apiFetch('/auth/2fa/disable', {
    method: 'POST',
    body: { password },
    requiresAuth: true,
  });
  const stored = getStoredUser();
  if (stored) {
    setStoredUser({ ...stored, twoFAEnabled: false });
  }
  return data;
}

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @param {string} [twoFACode]
 */
export async function loginUser(email, password, twoFACode) {
  const body = { email, password };
  if (twoFACode) {
    body.twoFACode = twoFACode;
  }
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body,
  });

  // If 2FA is required, return early without setting token
  if (data.requiresTwoFA) {
    return data;
  }

  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

/**
 * Save privacy settings
 */
export async function savePrivacySettings(settings) {
  return apiFetch('/auth/privacy', {
    method: 'POST',
    body: settings,
    requiresAuth: true,
  });
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  return apiFetch('/auth/me', {
    requiresAuth: true,
  });
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings() {
  return apiFetch('/auth/privacy', {
    requiresAuth: true,
  });
}

export { getToken, setToken, clearToken, getStoredUser, setStoredUser, clearAuth };