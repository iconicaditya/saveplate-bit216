import { test, expect } from '@playwright/test';

test.describe('SavePlate User Workflow, Analytics, & Iteration 2 E2E Tests', () => {

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

  // --- ITERATION 2 TESTS (TC-33 to TC-38) ---

  test('TC-33: Enter valid barcode 890123 -> Auto-Fill -> Populates Title/Category', async ({ page }) => {
    const invUser = `inv_${Date.now()}@example.com`;
    // Register & Login quick helper
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Inv');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/register\/.*/);

    await page.goto('/login');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/inventory');
    await page.click('button:has-text("Add Food Item")');

    // Fill valid barcode
    await page.fill('input[placeholder="Enter barcode (e.g., 890123)"]', '890123');
    await page.click('button:has-text("Auto-Fill")');

    // Verify auto-populated values (890123 maps to Fresh Apples / Produce)
    const nameInput = page.locator('input[placeholder="e.g. Whole Milk"]');
    await expect(nameInput).toHaveValue('Fresh Apples');

    const produceBtn = page.locator('button:has-text("Produce")');
    await expect(produceBtn).toHaveClass(/bg-\[#4CAF50\]/); // it should be highlighted/selected
  });

  test('TC-34: Enter unknown barcode 000000 -> Displays error message', async ({ page }) => {
    const invUser = `inv2_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Inv2');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');

    await page.goto('/login');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/inventory');
    await page.click('button:has-text("Add Food Item")');

    // Fill invalid barcode
    await page.fill('input[placeholder="Enter barcode (e.g., 890123)"]', '000000');
    await page.click('button:has-text("Auto-Fill")');

    // Verify error toast or message on form
    await expect(page.locator('text=Barcode not found. Try one of the suggested sample codes.')).toBeVisible();
  });

  test('TC-35: System detects items expiring in <= 2 days -> Displays toast banner', async ({ page }) => {
    const invUser = `inv3_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Inv3');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');

    await page.goto('/login');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/inventory');

    // Add an item expiring tomorrow
    await page.click('button:has-text("Add Food Item")');
    await page.fill('input[placeholder="e.g. Whole Milk"]', 'Expiring Soon Item');
    await page.fill('input[placeholder="1"]', '1');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tmrwStr = tomorrow.toISOString().split('T')[0];

    await page.fill('input[type="date"]', tmrwStr);
    await page.click('button:has-text("Save Item")');

    // Wait for the modal to close and table to refresh
    await expect(page.locator('text=Food item added successfully!')).toBeVisible();
    await page.waitForTimeout(1500); // Give time for modal close and refetch

    // Reload the page to trigger the check
    await page.reload();

    // Verify toast appears
    await expect(page.locator('text=Alert: You have 1 item expiring in 2 days or less')).toBeVisible();
  });

  test('TC-36 & TC-37: UI Batch Deletion & API Test', async ({ page, request }) => {
    // Because Playwright integrates UI and API testing beautifully, we can test TC-36 and TC-37 together.
    const invUser = `inv4_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Inv4');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');

    await page.goto('/login');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Retrieve the auth token from local storage to use in the API request
    const token = await page.evaluate(() => localStorage.getItem('saveplate_token'));

    // Create 3 items via API to save time setting up the UI test
    const itemsToCreate = ['Item 1', 'Item 2', 'Item 3'];
    const itemIds = [];

    for (const name of itemsToCreate) {
      const res = await request.post('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          name, category: 'Produce', quantity: '1', unit: 'items',
          expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), storage: 'Fridge'
        }
      });
      const data = await res.json();
      itemIds.push(data.item.id);
    }

    // Now test TC-36 (Select 3 checkboxes -> Click "Delete Selected")
    await page.goto('/inventory');
    await expect(page.locator('text=Item 1')).toBeVisible();

    // Select all via header checkbox
    await page.locator('thead input[type="checkbox"]').check();

    // Click Delete Selected
    page.on('dialog', dialog => dialog.accept()); // Automatically accept the confirm alert
    await page.click('button:has-text("Delete Selected")');

    // Verify success toast and table is empty
    await expect(page.locator('text=Successfully deleted 3 items')).toBeVisible();
    await expect(page.locator('text=No food items found. Add your first item!')).toBeVisible();

    // Now test TC-37 (Automated API test executes batch deletion payload directly)
    // First create 2 new items
    const apiIds = [];
    for (let i = 0; i < 2; i++) {
        const res = await request.post('/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            name: `API Item ${i}`, category: 'Produce', quantity: '1', unit: 'items',
            expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), storage: 'Fridge'
          }
        });
        const data = await res.json();
        apiIds.push(data.item.id);
      }

    // Execute Batch Delete Payload
    const batchRes = await request.delete('/api/inventory/batch', {
       headers: { Authorization: `Bearer ${token}` },
       data: { ids: apiIds }
     });

    expect(batchRes.status()).toBe(200);
    const batchData = await batchRes.json();
    expect(batchData.deletedCount).toBe(2);
  });

  test('TC-38: Regression check: Click "Convert to Donation"', async ({ page }) => {
    const invUser = `inv5_${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Inv5');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.selectOption('select[name="householdSize"]', '1');
    await page.click('button[type="submit"]');

    await page.goto('/login');
    await page.fill('input[name="email"]', invUser);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/inventory');

    // Add Item
    await page.click('button:has-text("Add Food Item")');
    await page.fill('input[placeholder="e.g. Whole Milk"]', 'Donate Me Canned Beans');
    await page.fill('input[placeholder="1"]', '5');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0]);
    await page.click('button:has-text("Save Item")');
    await expect(page.locator('text=Food item added successfully!')).toBeVisible();
    await page.waitForTimeout(1500);

    // Click Donate Action
    await page.click('button[title="Donate"]');
    await expect(page.locator('h3:has-text("Donate")')).toBeVisible();

    // Fill form
    await page.fill('input[placeholder="e.g. 123 Main St, Apt 4B"]', '123 Test Ave');
    await page.click('button:has-text("Confirm Donation")');

    // Verify Toast
    await expect(page.locator('text=Donation created successfully!')).toBeVisible();

    // Go to My Donations and verify
    await page.goto('/donations');
    await expect(page.locator('text=Donate Me Canned Beans')).toBeVisible();
  });
});
