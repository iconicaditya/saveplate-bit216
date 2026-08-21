# Playwright Test Suites

All browser and API automation uses one shared Playwright configuration: `playwright.config.ts`.
The test suite is organized by ownership so every team member can work, run tests, and collect evidence independently.

## Directory Ownership

| Owner | Student ID | Use Cases | Test File | Test Cases |
| --- | --- | --- | --- | --- |
| Aaditya Chaudhary | E2300548 | UC1, UC4 | `tests/aaditya/auth-analytics.spec.ts` | TC-27 to TC-32 |
| Aakroshan Chaudhary | E2300551 | UC2, UC5 | `tests/aakroshan/inventory-operations.spec.ts` | TC-33 to TC-38 |
| Ajay Kumar Goit | E2300553 | UC3, UC6 | `tests/ajay/marketplace-recipes.spec.ts` | TC-39 to TC-44 |

## Before Running Tests

Start SavePlate in a separate terminal:

```bash
npm run dev
```

The shared Playwright configuration expects the application at `http://localhost:3000`.

## Run Commands

Run all Playwright tests:

```bash
npm run test:e2e
```

Run one member's owned suite only:

```bash
npm run test:aaditya
npm run test:aakroshan
npm run test:ajay
```

Run a visible browser session while debugging a suite:

```bash
npx playwright test tests/ajay --headed
```

Run one test case by title:

```bash
npx playwright test tests/aakroshan -g "TC-33"
```

## Notes for Members

- Tests create isolated test accounts using timestamped email addresses.
- Each suite should be kept within its owner directory; shared test helpers should be added under `tests/helpers/` when needed by more than one member.
- Ajay's TC-42 updates `claimedAt` directly through Prisma only to simulate 25 elapsed hours. The validation, Marketplace reload, and release assertion remain Playwright-driven.
- Playwright artifacts (traces, video on failure, and HTML reports) are controlled centrally through `playwright.config.ts`.
