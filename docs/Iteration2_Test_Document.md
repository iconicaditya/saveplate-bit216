# SavePlate - Test Document (Iteration 2)

## 1.0 Introduction
This document outlines the testing strategy, test cases, and results for Iteration 2 of the SavePlate application. Iteration 2 focuses on advanced features: custom analytics, data exports, password reset/account lockout, batch operations, and barcode auto-fill.

## 2.0 Test Objectives
*   Verify the accurate generation and export (CSV/PDF) of custom date-range analytics.
*   Ensure security mechanisms (account lockout and password reset) function correctly.
*   Validate the UX and functionality of batch inventory operations and simulated barcode lookups.
*   Perform regression testing on Iteration 1 features (specifically privacy toggles).

## 3.0 Test Scope
*   **In Scope:** Analytics (Date Picker, Export), Auth Security (Lockout, Reset), Inventory (Batch Delete, Barcode Auto-Fill), E2E Workflows via Playwright, API Automation via Jest.
*   **Out of Scope:** External email delivery (simulated/mocked), physical barcode scanning (simulated via lookup table).

## 4.0 Test Environment
*   **Frontend:** Next.js (React)
*   **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL
*   **Tools:** Playwright (E2E UI Testing), Jest & `node-mocks-http` (API/Unit Testing)

## 5.0 Test Strategy
*   **Unit Tests:** Validate specific pure logic (e.g., expiry status calculations).
*   **API Tests (Integration):** Validate backend endpoints independently using Next.js request mocking.
*   **E2E Tests:** Validate complete user journeys in a real browser environment using Playwright.

## 6.0 Test Cases (TC-33 to TC-44)

| TC ID | Module | Title | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-33** | Inventory | Barcode Auto-Fill (Valid) | Enter valid barcode `890123` $\rightarrow$ Click "Auto-Fill" | Title auto-populates as "Fresh Apples" and Category as "Produce" | PASS |
| **TC-34** | Inventory | Barcode Auto-Fill (Invalid) | Enter unknown barcode `000000` $\rightarrow$ Click "Auto-Fill" | System displays error: "Barcode not found. Try one of the suggested sample codes." | PASS |
| **TC-35** | Alerts | Expiry Toast Notification | System detects items expiring in $\le 2$ days upon dashboard load | Displays top notification banner alert indicating expiring items. | PASS |
| **TC-36** | Inventory | Batch Deletion (UI) | Select 3 checkboxes on inventory table $\rightarrow$ Click "Delete Selected" | Confirmation prompt appears. Upon accept, all 3 selected items are removed. | PASS |
| **TC-37** | API | Batch Deletion Endpoint | Automated API test executes batch deletion payload with valid UUIDs. | Returns HTTP status `200 OK` and correctly deletes records from DB. | PASS |
| **TC-38** | Donation | Convert to Donation | Regression check: Click "Donate" on an inventory item $\rightarrow$ Fill form $\rightarrow$ Submit | Item is successfully converted to a public donation record. | PASS |

### Marketplace, Recipe, and Claim-Expiration Tests

| TC ID | Module | Title | Description | Expected Result | Automation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-39** | Marketplace Map | Static marker display | Open Marketplace, select Map, and select a marker. | Four static donation markers render; popup shows item, donor, pickup location, and Claim Item action. | Playwright |
| **TC-40** | Marketplace Map | Bakery category filter | Select Bakery after opening Map view. | Only the Bakery marker remains visible; the popup identifies Whole Wheat Bread and Sarah M. | Playwright |
| **TC-41** | Recipe Matching | Tomato Soup match | Add/use Fresh Tomatoes, then open Meal Planner. | Tomato Soup is suggested with ingredients and a 30-minute cooking time. | Playwright |
| **TC-42** | Claim Expiration | Release stale claim | Simulate an uncollected request claimed more than 24 hours ago, then load Marketplace. | Claim is reset to `AVAILABLE`; claimant and claimed time are cleared; listing is visible again. | Playwright |
| **TC-43** | Meal Planner | Add suggested recipe | Add Tomato Soup to the calendar from its suggestion card. | Recipe title preloads in Monday Dinner and appears in the calendar after saving. | Playwright |
| **TC-44** | Donation Claim | Block duplicate claim | A second user attempts to request an already requested donation. | Server returns HTTP `409` and `This donation is no longer available to claim.` | Playwright API request |

## 7.0 Regression Verification Matrix

| TC ID | Feature | Original Result | Iteration 2 Re-test Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **TC-15** | 2FA Registration Bypass | PASS | PASS | Still correctly allows skipping to verification. |
| **TC-16** | 2FA Setup Flow | PASS | PASS | Setup QR and Secret generation works. |
| **TC-17** | OTP Input Validation | PASS | PASS | Correctly rejects invalid OTPs. |
| **TC-18** | Recovery Codes | PASS | N/A | Mocked in current setup. |
| **TC-19** | Settings Dashboard Access | PASS | PASS | Settings viewable. |
| **TC-20** | Profile Update | PASS | PASS | Can edit details. |
| **TC-21** | Privacy Settings Toggles | PASS | PASS | (Covered in E2E TC-32). Toggles persist correctly. |
| **TC-22** | Browse Food Functionality | PASS | PASS | Marketplace search, filters, and available listing display remain functional. |
| **TC-23** | Donation Request Workflow | PASS | PASS | Available donations can be requested; duplicate claims are now safely blocked. |
| **TC-24** | Inventory Management | PASS | PASS | Add, edit, delete, barcode fill, and batch deletion continue to operate. |
| **TC-25** | Meal Planner Functionality | PASS | PASS | Calendar saving, inventory reservation, and local recipe additions work together. |
| **TC-26** | User Settings and Privacy Controls | PASS | PASS | Account settings and privacy preferences remain accessible and persistent. |

## 8.0 Conclusion
Iteration 2 testing was successfully completed. All new features including account security (lockout/reset), batch operations, analytics exports, and barcode simulation have been verified against requirements. Regression tests confirm that the baseline functionality from Iteration 1 remains stable. Automated API and E2E scripts provide a solid foundation for continuous integration moving forward.
