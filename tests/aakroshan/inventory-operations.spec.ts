import { test, expect } from '@playwright/test';

test.describe('Aakroshan Chaudhary (E2300551) - UC2 & UC5', () => {
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

  test('TC-36: Select inventory items and delete the selected rows', async ({ page, request }) => {
    const invUser = `batch-ui-${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Batch');
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

    const token = await page.evaluate(() => localStorage.getItem('saveplate_token'));
    for (const name of ['Batch Item 1', 'Batch Item 2', 'Batch Item 3']) {
      const response = await request.post('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
        data: { name, category: 'Produce', quantity: '1', unit: 'items', expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), storage: 'Fridge' },
      });
      expect(response.status()).toBe(201);
    }

    await page.goto('/inventory');
    await expect(page.getByText('Batch Item 1')).toBeVisible();
    await page.locator('thead input[type="checkbox"]').check();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /Delete Selected/ }).click();
    await expect(page.getByText('Successfully deleted 3 items')).toBeVisible();
    await expect(page.getByText('No food items found. Add your first item!')).toBeVisible();
  });

  test('TC-37: Delete an array of items through the batch API and receive HTTP 200', async ({ page, request }) => {
    const invUser = `batch-api-${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Batch');
    await page.fill('input[name="lastName"]', 'API');
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

    const token = await page.evaluate(() => localStorage.getItem('saveplate_token'));
    const ids: string[] = [];
    for (const name of ['Batch API Item 1', 'Batch API Item 2']) {
      const response = await request.post('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
        data: { name, category: 'Produce', quantity: '1', unit: 'items', expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), storage: 'Fridge' },
      });
      expect(response.status()).toBe(201);
      ids.push((await response.json()).item.id);
    }

    const batchResponse = await request.delete('/api/inventory/batch', {
      headers: { Authorization: `Bearer ${token}` },
      data: { ids },
    });
    expect(batchResponse.status()).toBe(200);
    expect((await batchResponse.json()).deletedCount).toBe(2);
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
