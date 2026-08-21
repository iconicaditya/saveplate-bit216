import { test, expect } from '@playwright/test';

test.describe('Aaditya Chaudhary (E2300548) - UC1 & UC4', () => {

  const timestamp = Date.now();
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser_${timestamp}@example.com`,
    password: 'Password123!',
    householdSize: '2',
    location: 'New York, NY',
  };

  test('TC-27: E2E Registration & Login flow execution', async ({ page }) => {
    // 1. Navigate to register page
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Create your account');

    // 2. Fill out registration form
    await page.fill('input[name="firstName"]', testUser.firstName);
    await page.fill('input[name="lastName"]', testUser.lastName);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.selectOption('select[name="householdSize"]', testUser.householdSize);
    await page.fill('input[name="location"]', testUser.location);

    // 3. Submit registration
    await page.click('button[type="submit"]');

    // 4. Verify redirection to Privacy setup or 2FA (depending on flow, wait for URL)
    await page.waitForURL(/.*\/register\/(privacy|2fa-setup)/);

    // Skip/Complete privacy
    if (page.url().includes('privacy')) {
      await page.click('button:has-text("Save preferences")');
      await page.waitForURL(/.*\/register\/(2fa-setup|verify-email)/);
    }

    // Skip 2FA setup for now
    if (page.url().includes('2fa-setup')) {
      await page.click('button:has-text("Skip for now")');
      await page.waitForURL(/.*\/register\/verify-email/);
    }

    // Since we can't easily fetch the actual email token in E2E without mail server mocking,
    // we assume the user exists in DB and we can attempt to login.
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Verify successful login redirects to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('TC-28: Account lockout trigger after 5 consecutive failed login attempts', async ({ page }) => {
    await page.goto('/login');

    // Attempt 1 to 5
    for (let i = 1; i <= 5; i++) {
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', 'WrongPassword123');
      await page.click('button[type="submit"]');

      if (i < 5) {
        await expect(page.locator('text=Invalid email or password')).toBeVisible();
      } else {
        await expect(page.locator('text=Account locked')).toBeVisible();
      }
    }

    // Attempt 6 (Should still be locked)
    await page.fill('input[name="password"]', testUser.password); // Even with correct password, should be locked
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Account locked')).toBeVisible();
  });

  test('TC-29: Password reset request with valid link/token generation', async ({ page }) => {
    // 1. Navigate to Forgot Password page
    await page.goto('/login');
    await page.click('text=Forgot password?');
    await page.waitForURL('/forgot-password');

    // 2. Request reset link
    await page.fill('input[name="email"]', testUser.email);
    await page.click('button[type="submit"]');

    // 3. Verify success message
    await expect(page.locator('text=Check your email')).toBeVisible();

    // Note: We cannot easily test the actual reset token usage via E2E without intercepting the console log or db.
    // Testing the UI flow for the reset page:
    await page.goto('/reset-password?token=dummy-token-for-ui-test');
    await expect(page.locator('h2')).toContainText('Create new password');

    // Fill new password
    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    await page.click('button[type="submit"]');

    // Since it's a dummy token, it should fail, proving the form works and submits.
    await expect(page.locator('text=Invalid or expired reset token')).toBeVisible();
  });

  test('TC-30: Custom date-range analytics filter execution', async ({ page }) => {
    // Requires a logged-in user to view analytics
    // Since previous test locked the user out, we create a new one just for this (or mock login)
    // To keep it simple, we'll register a quick new user
    const analyticsUser = `analytics_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Analytics');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', analyticsUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/register\/.*/);

    await page.goto('/login');
    await page.fill('input[name="email"]', analyticsUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 1. Go to Analytics
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Impact analytics');

    // 2. Select Custom Range
    await page.selectOption('select[aria-label="Reporting range"]', 'custom');

    // 3. Ensure date pickers appear
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs).toHaveCount(2);

    // 4. Fill dates
    await dateInputs.nth(0).fill('2026-06-01');
    await dateInputs.nth(1).fill('2026-07-15');

    // Wait for API call/loading state to resolve
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    await expect(page.locator('text=Activity over time')).toBeVisible();
  });

  test('TC-31: CSV/PDF analytics export generation and file download verification', async ({ page }) => {
    // Assuming we are already on the analytics page from previous test setup, or just navigate
    // Let's create a fresh context if needed, but playwright runs tests isolated by default.
    // So we need to login again.

    const exportUser = `export_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Export');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', exportUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');

    await page.goto('/login');
    await page.fill('input[name="email"]', exportUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/analytics');
    await expect(page.locator('.animate-pulse')).toHaveCount(0); // wait for load

    // Test CSV Download
    const downloadCsvPromise = page.waitForEvent('download');
    await page.click('button:has-text("CSV")');
    const csvDownload = await downloadCsvPromise;
    expect(csvDownload.suggestedFilename()).toContain('.csv');

    // Test PDF Download
    const downloadPdfPromise = page.waitForEvent('download');
    await page.click('button:has-text("PDF")');
    const pdfDownload = await downloadPdfPromise;
    expect(pdfDownload.suggestedFilename()).toContain('.pdf');
  });

  test('TC-32: Regression check on privacy setting toggles (TC-09 re-test)', async ({ page }) => {
    const privacyUser = `privacy_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Privacy');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', privacyUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*\/register\/privacy/);

    // Check toggles exist
    const toggles = page.locator('button[role="switch"]');
    await expect(toggles).toHaveCount(4);

    // Toggle them off
    for (let i = 0; i < 4; i++) {
        const toggle = toggles.nth(i);
        const isChecked = await toggle.getAttribute('aria-checked');
        if (isChecked === 'true') {
            await toggle.click();
        }
    }

    // Save preferences
    await page.click('button:has-text("Save preferences")');
    await page.waitForURL(/.*\/register\/(2fa-setup|verify-email)/);

    // We can also verify they persist if we log in and go to settings
    await page.goto('/login');
    await page.fill('input[name="email"]', privacyUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/settings');
    await page.click('text=Privacy');

    // Verify they are all off
    const settingsToggles = page.locator('button[role="switch"]');
    for (let i = 0; i < 4; i++) {
        await expect(settingsToggles.nth(i)).toHaveAttribute('aria-checked', 'false');
    }
  });
});
