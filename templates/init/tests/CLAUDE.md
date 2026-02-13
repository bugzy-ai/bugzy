# Testing Framework

## Framework
Playwright with TypeScript

## Test Execution

Run commands from the project root directory.

**Run all tests:**
```bash
npm test
```

**Run specific file:**
```bash
npm test -- tests/specs/login.spec.ts
```

**Run by file pattern:**
```bash
npm test -- [selector]
```

**Run by tag:**
```bash
npm test -- --grep "@smoke"
```

**Run single test file directly:**
```bash
npx playwright test [test-file]
```

**Configuration:** `playwright.config.ts` automatically loads environment variables from `.env.testdata` and `.env` files. No manual env export needed.

**Custom Reporter:** The Bugzy reporter runs automatically via `playwright.config.ts` — do NOT use `--reporter` flag, as the custom reporter must run to create the hierarchical test-runs output.

## Directory Structure

- **Test specs:** `./tests/specs/` — organized by feature in subdirectories
- **Page Objects:** `./tests/pages/` — extend BasePage class
- **Components:** `./tests/components/` — reusable UI element objects
- **Fixtures:** `./tests/fixtures/` — common test setup (e.g., `pages.fixture.ts`)
- **Helpers:** `./tests/helpers/` — data generation and utilities (e.g., `dateUtils.ts`, `dataGenerators.ts`)
- **Types:** `./tests/types/` — TypeScript type definitions
- **Setup:** `./tests/setup/` — auth setup and global config (e.g., `auth.setup.ts`)
- **Test data:** `./tests/data/` — static test data files
- **Auth state:** `./tests/.auth/` — stored authentication state
- **Reporters:** `./reporters/` — custom Bugzy reporter (`bugzy-reporter.ts`)
- **Test results:** `./test-runs/` — hierarchical results: `{timestamp}/{testCaseId}/exec-{N}/`

## Conventions

### Test Structure
- Every test uses `test.step()` calls matching the manual test case steps one-to-one
- Each `test.step()` should directly correspond to a numbered step in the manual test case
- Reference manual test case ID in comments
- Tag critical tests with `@smoke`
- Tests must be independent — no test interdependencies

### Page Object Model
- Page Objects extend `BasePage` class
- **No assertions in Page Objects** — only actions and getters
- Page Objects contain semantic selectors verified in the live application
- Properly typed with TypeScript

### Selector Priority
Use selectors in this priority order:
1. `getByRole('button', { name: 'Sign In' })` — role-based (preferred)
2. `getByLabel('Email')` — label-based
3. `getByText('Welcome')` — text content
4. `[data-testid="submit"]` — test IDs
5. CSS selectors — **last resort only**

**NEVER assume selectors** — always verify in the live application using browser automation before writing tests.

### Waiting and Synchronization
- **Never use `waitForTimeout()`** — rely on Playwright's auto-waiting
- Use `toBeVisible()`, `toHaveCount()`, `toHaveText()` assertions for waits
- Prefer `waitFor({ state: 'visible' })` over arbitrary delays
- Use `page.waitForLoadState('networkidle')` after navigation
- Handle dynamic content with explicit waits for specific conditions

### Environment Variables
- Reference variables using `process.env.VAR_NAME` in tests
- Read `.env.testdata` for available non-secret environment variables
- **NEVER read `.env` file** (contains secrets only)
- Add new required variables to `.env.testdata` with `# TODO: configure` comment

## Common Fix Patterns

### Fix Type 1: Brittle Selectors
- **Problem**: CSS selectors or fragile XPath that breaks when UI changes
- **Fix**: Replace with role-based selectors
```typescript
// BEFORE (brittle)
await page.locator('.btn-primary').click();
// AFTER (semantic)
await page.getByRole('button', { name: 'Sign In' }).click();
```

### Fix Type 2: Missing Wait Conditions
- **Problem**: Test doesn't wait for elements or actions to complete
- **Fix**: Add explicit wait for expected state
```typescript
// BEFORE (race condition)
await page.goto('/dashboard');
const items = await page.locator('.item').count();
// AFTER (explicit wait)
await page.goto('/dashboard');
await expect(page.locator('.item')).toHaveCount(5);
```

### Fix Type 3: Race Conditions
- **Problem**: Test executes actions before application is ready
- **Fix**: Wait for specific application state
```typescript
// BEFORE
await saveButton.click();
await expect(successMessage).toBeVisible();
// AFTER
await page.locator('.validation-complete').waitFor();
await saveButton.click();
await expect(successMessage).toBeVisible();
```

### Fix Type 4: Wrong Assertions
- **Problem**: Assertion expects incorrect value or state
- **Fix**: Update assertion to match actual application behavior (if application is correct)

### Fix Type 5: Test Isolation Issues
- **Problem**: Test depends on state from previous tests
- **Fix**: Add proper setup/teardown or use fixtures

### Fix Type 6: Flaky Tests
- **Problem**: Test passes inconsistently
- **Fix**: Identify non-determinism source (timing, race conditions, animation delays)
- Run test 10 times to confirm stability after fix

## Failure Triage Guide

**Classification Decision Matrix:**

| Failure Type | Root Cause | Action |
|--------------|------------|--------|
| Selector not found | Element exists, wrong selector | Replace with semantic selector |
| Timeout waiting | Missing wait condition | Add explicit wait |
| Flaky (timing) | Race condition | Add synchronization wait |
| Wrong assertion | Incorrect expected value | Update assertion (if app is correct) |
| Test isolation | Depends on other tests | Add setup/teardown or fixtures |
| Product bug | App behaves incorrectly | STOP — report as bug, don't fix test |

**Product Bug Indicators:**
- Selectors are correct and elements exist
- Test logic matches intended user flow
- Application behavior doesn't match requirements
- Error indicates functional problem (API error, validation failure)
- Screenshots show application in wrong state

**Test Issue Indicators:**
- Selector not found (element exists but selector is wrong)
- Timeout errors (missing wait conditions)
- Flaky behavior (passes sometimes, fails other times)
- Wrong assertions (expecting incorrect values)
- Test isolation problems (depends on other tests)

## Test Result Artifacts

Test results follow the hierarchical structure created by the Bugzy reporter:

- **Manifest**: `test-runs/{timestamp}/manifest.json` — overall run summary
- **Per-execution results**: `test-runs/{timestamp}/{testCaseId}/exec-{num}/result.json`
- **Attachments**: Video, trace, and screenshots in the same `exec-{num}/` folder
- **Execution ID**: `test-runs/{timestamp}/execution-id.txt` (from BUGZY_EXECUTION_ID)

Video recording is automatic via playwright-cli `--save-video` flag. Videos are saved to `.playwright-mcp/` and uploaded to GCS by external service. Do NOT copy, move, or delete video files.

## Reference Guides

Detailed testing guides are available in `./docs/`:
- `testing-best-practices.md` — Test organization, Page Object Model, selector strategies, authentication, debugging, and production-ready checklist
- `test-execution-strategy.md` — Test tier selection (Smoke, Component, Full Regression), tag taxonomy, and decision tree for choosing which tests to run

## Anti-Patterns

- **DO NOT** use `waitForTimeout()` — masks real timing issues
- **DO NOT** put assertions in Page Objects — only in test files
- **DO NOT** hardcode test data — use environment variables
- **DO NOT** create test interdependencies — tests must be independent
- **DO NOT** assume selectors without verifying in the live application
- **DO NOT** make tests pass by lowering expectations
- **DO NOT** skip proper verification of fixes
