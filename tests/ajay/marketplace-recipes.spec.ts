import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import prisma from "@/lib/prisma";

type TestAccount = { id: string; token: string; email: string };

const createdUserIds: string[] = [];
let accountSequence = 0;

async function createAccount(request: APIRequestContext, prefix: string): Promise<TestAccount> {
  accountSequence += 1;
  const email = `${prefix}-${Date.now()}-${accountSequence}@example.com`;
  const response = await request.post("/api/auth/register", {
    data: {
      firstName: prefix,
      lastName: "Tester",
      email,
      password: "Password123!",
      householdSize: "2",
      location: "New York, NY",
    },
  });

  expect(response.status()).toBe(201);
  const body = await response.json();
  createdUserIds.push(body.user.id);
  return { id: body.user.id, token: body.token, email };
}

function authHeaders(account: TestAccount) {
  return { Authorization: `Bearer ${account.token}` };
}

async function authenticatePage(page: Page, account: TestAccount) {
  await page.addInitScript(({ token, email, id }) => {
    localStorage.setItem("saveplate_token", token);
    localStorage.setItem("saveplate_user", JSON.stringify({ id, email, firstName: "Playwright", lastName: "Tester" }));
  }, account);
}

async function createInventoryItem(request: APIRequestContext, account: TestAccount, name: string) {
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const response = await request.post("/api/inventory", {
    headers: authHeaders(account),
    data: { name, category: "Produce", quantity: "2", unit: "items", expiryDate, storage: "Fridge" },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).item;
}

async function publishDonation(request: APIRequestContext, account: TestAccount, foodItemId: string) {
  const response = await request.post("/api/donations", {
    headers: authHeaders(account),
    data: { foodItemId, pickupLocation: "100 Test Street", availability: "Today, 10am-4pm", notes: "Playwright test item" },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).donation;
}

test.describe("Ajay Kumar Goit (E2300553) - UC3 & UC6", () => {
  test.afterAll(async () => {
    if (createdUserIds.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.$disconnect();
  });

  test("TC-39: Open Marketplace Map and verify static donation markers and popup details", async ({ page, request }) => {
    const account = await createAccount(request, "map");
    await authenticatePage(page, account);

    await page.goto("/browse");
    await page.getByRole("button", { name: "Map" }).click();

    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers).toHaveCount(4);
    await markers.first().click();

    await expect(page.getByText("Fresh Organic Apples")).toBeVisible();
    await expect(page.getByText("John D.")).toBeVisible();
    await expect(page.getByText("Downtown Community Center")).toBeVisible();
    await expect(page.getByRole("button", { name: "Claim Item" })).toBeVisible();
  });

  test("TC-40: Select Bakery and verify non-Bakery map donations are hidden", async ({ page, request }) => {
    const account = await createAccount(request, "bakery-map");
    await authenticatePage(page, account);

    await page.goto("/browse");
    await page.getByRole("button", { name: "Map" }).click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(4);

    await page.locator("aside label").filter({ hasText: "Bakery" }).getByRole("checkbox").check();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    await page.locator(".leaflet-marker-icon").click();
    await expect(page.getByText("Whole Wheat Bread")).toBeVisible();
    await expect(page.getByText("Sarah M.")).toBeVisible();
    await expect(page.getByText("Fresh Organic Apples")).not.toBeVisible();
  });

  test("TC-41: Tomato Soup is suggested when Tomato is available in inventory", async ({ page, request }) => {
    const account = await createAccount(request, "recipe-match");
    await createInventoryItem(request, account, "Fresh Tomatoes");
    await authenticatePage(page, account);

    await page.goto("/meal-planner");
    await expect(page.getByText("Local recipe suggestions")).toBeVisible();

    const tomatoSoupCard = page.getByRole("heading", { name: "Tomato Soup" }).locator("..").locator("..");
    await expect(tomatoSoupCard).toBeVisible();
    await expect(tomatoSoupCard.getByText("30 min")).toBeVisible();
    await expect(tomatoSoupCard.getByText("Available: 6 medium Tomatoes")).toBeVisible();
  });

  test("TC-43: Add a suggested recipe to the calendar and verify its meal slot", async ({ page, request }) => {
    const account = await createAccount(request, "recipe-calendar");
    await createInventoryItem(request, account, "Fresh Tomatoes");
    await authenticatePage(page, account);

    await page.goto("/meal-planner");
    const tomatoSoupCard = page.getByRole("heading", { name: "Tomato Soup" }).locator("..").locator("..");
    await tomatoSoupCard.getByRole("button", { name: "Add Recipe to Calendar" }).click();
    await expect(page.getByRole("heading", { name: "Add Dinner" })).toBeVisible();
    await expect(page.getByPlaceholder("Meal name")).toHaveValue("Tomato Soup");
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page.getByText("Tomato Soup")).toBeVisible();
  });

  test("TC-42: Marketplace releases a claim older than 24 hours back to Available", async ({ page, request }) => {
    const donor = await createAccount(request, "expired-donor");
    const claimant = await createAccount(request, "expired-claimant");
    const viewer = await createAccount(request, "expired-viewer");
    const item = await createInventoryItem(request, donor, "Expired Claim Apples");
    const donation = await publishDonation(request, donor, item.id);

    const claimResponse = await request.patch(`/api/donations/${donation.id}`, {
      headers: authHeaders(claimant),
      data: { action: "request" },
    });
    expect(claimResponse.status()).toBe(200);

    // Playwright owns the end-to-end test; the database adjustment only simulates the elapsed 24-hour interval.
    await prisma.donation.update({
      where: { id: donation.id },
      data: { claimedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
    });

    await authenticatePage(page, viewer);
    await page.goto("/browse");

    await expect(page.getByText("Expired Claim Apples")).toBeVisible();
    const released = await prisma.donation.findUniqueOrThrow({ where: { id: donation.id } });
    expect(released.status).toBe("AVAILABLE");
    expect(released.claimantId).toBeNull();
    expect(released.claimedAt).toBeNull();
  });

  test("TC-44: Attempt to claim an already claimed item and verify the server blocks it", async ({ request }) => {
    const donor = await createAccount(request, "claimed-donor");
    const firstClaimant = await createAccount(request, "first-claimant");
    const secondClaimant = await createAccount(request, "second-claimant");
    const item = await createInventoryItem(request, donor, "Already Claimed Bread");
    const donation = await publishDonation(request, donor, item.id);

    const firstClaim = await request.patch(`/api/donations/${donation.id}`, {
      headers: authHeaders(firstClaimant),
      data: { action: "request" },
    });
    expect(firstClaim.status()).toBe(200);

    const duplicateClaim = await request.patch(`/api/donations/${donation.id}`, {
      headers: authHeaders(secondClaimant),
      data: { action: "request" },
    });
    expect(duplicateClaim.status()).toBe(409);
    expect((await duplicateClaim.json()).error).toMatch(/no longer available to claim/i);
  });
});
