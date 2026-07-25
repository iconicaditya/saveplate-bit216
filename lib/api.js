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
export async function registerUser({ firstName, lastName, email, password, householdSize, location, profileImageUrl }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: { firstName, lastName, email, password, householdSize, location, profileImageUrl },
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

// ─── Food Inventory API Methods ───────────────────────────────────

/**
 * Fetch all food items for the current user
 */
export async function getInventoryItems(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.storage) query.set('storage', params.storage);
  if (params.status) query.set('status', params.status);
  if (params.expiry) query.set('expiry', params.expiry);
  if (params.search) query.set('search', params.search);

  const qs = query.toString();
  return apiFetch(`/inventory${qs ? `?${qs}` : ''}`, { requiresAuth: true });
}

/**
 * Create a new food item
 */
export async function createFoodItem(data) {
  return apiFetch('/inventory', {
    method: 'POST',
    body: data,
    requiresAuth: true,
  });
}

/**
 * Update a food item
 */
export async function updateFoodItem(id, data) {
  return apiFetch(`/inventory/${id}`, {
    method: 'PUT',
    body: data,
    requiresAuth: true,
  });
}

/**
 * Delete a food item
 */
export async function deleteFoodItem(id) {
  return apiFetch(`/inventory/${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

// ─── Donations and Meal Planning API Methods ──────────────────────
export async function getDonations(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.expiry) query.set('expiry', params.expiry);
  (params.category || []).forEach((value) => query.append('category', value));
  (params.storage || []).forEach((value) => query.append('storage', value));
  const qs = query.toString();
  return apiFetch(`/donations${qs ? `?${qs}` : ''}`, { requiresAuth: true });
}
export async function getMyDonations() { return apiFetch('/donations?mine=true', { requiresAuth: true }); }

export async function publishDonation(data) { return apiFetch('/donations', { method: 'POST', body: data, requiresAuth: true }); }
export async function getDonation(id) { return apiFetch(`/donations/${id}`, { requiresAuth: true }); }
export async function updateDonation(id, action) { return apiFetch(`/donations/${id}`, { method: 'PATCH', body: { action }, requiresAuth: true }); }
export async function getMealPlan(weekStart) { return apiFetch(`/meal-plans?weekStart=${weekStart}`, { requiresAuth: true }); }
export async function savePlannedMeal(data) { return apiFetch('/meal-plans', { method: 'POST', body: data, requiresAuth: true }); }
export async function confirmMealPlan(weekStart) { return apiFetch('/meal-plans/confirm', { method: 'POST', body: { weekStart }, requiresAuth: true }); }
export async function cancelMealPlan(weekStart) { return apiFetch('/meal-plans/confirm', { method: 'DELETE', body: { weekStart }, requiresAuth: true }); }

// ─── Notifications API Methods ────────────────────────────────────

/**
 * Fetch notifications for the current user
 */
export async function getNotifications(filter = 'all') {
  return apiFetch(`/notifications?filter=${filter}`, { requiresAuth: true });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(id) {
  return apiFetch('/notifications', {
    method: 'POST',
    body: { id },
    requiresAuth: true,
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  return apiFetch('/notifications', {
    method: 'POST',
    body: { markAll: true },
    requiresAuth: true,
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(id) {
  return apiFetch(`/notifications?id=${id}`, {
    method: 'DELETE',
    requiresAuth: true,
  });
}

export { getToken, setToken, clearToken, getStoredUser, setStoredUser, clearAuth };
