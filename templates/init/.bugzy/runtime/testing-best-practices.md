# Testing Best Practices Reference

## Two-Phase Test Automation Workflow

**Critical Distinction**: Separate test scenario discovery from automation implementation.

### Phase 1: Test Scenario Discovery (WHAT to test)

**Goal**: Understand application behavior and identify what needs testing coverage.

**Activities**:
- Explore features and user workflows through manual interaction
- Identify critical user paths and edge cases
- Document test scenarios in human-readable format
- Evaluate automation ROI for each scenario
- Create manual test case documentation

**Output**: Test plan with prioritized scenarios and automation decisions

### Phase 2: Automation Implementation (HOW to automate)

**Goal**: Build robust test automation framework validated with working tests.

**Activities**:
- Technical exploration to identify correct selectors
- Create Page Object infrastructure
- Generate ONE smoke test to validate framework
- Run and debug until test passes consistently
- Scale to additional tests only after validation

**Output**: Working test automation with validated Page Objects

### The "Test One First" Validation Loop

**CRITICAL**: Always validate your framework with ONE working test before scaling.

```
1. Explore app for selectors (use Playwright MCP or codegen)
2. Create Page Objects with verified selectors
3. Write ONE critical path test (e.g., login)
4. Run the test: npx playwright test <test-file>
5. If fails → Debug and fix → Go to step 4
6. If passes → Run 3-5 more times to ensure stability
7. Once stable → Scale to additional tests
```

**Why this matters**:
- Catches framework issues early (config, setup, auth)
- Validates selectors work in real application
- Prevents generating 50 broken tests
- Builds confidence in Page Object reliability

**Example validation workflow**:
```bash
# Generate ONE test first
npx playwright test tests/specs/auth/login.spec.ts

# Run multiple times to verify stability
npx playwright test tests/specs/auth/login.spec.ts --repeat-each=5

# Check for flakiness
npx playwright test tests/specs/auth/login.spec.ts --workers=1

# Once stable, generate more tests
```

## Page Object Model (POM) Architecture

**Core Principle**: Separate locators, actions, and assertions into distinct layers to isolate UI changes from test logic.

### Page Object Structure

```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Centralized selectors as readonly properties
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### Key Rules for Page Objects

- ✅ Define all locators as `readonly` properties
- ✅ Initialize locators in constructor
- ✅ Use method names that describe actions (login, fillEmail, clickSubmit)
- ✅ Return data, never assert in page objects
- ❌ Never put `expect()` assertions in page objects
- ❌ Never use hardcoded waits (`waitForTimeout`)

## Selector Priority (Most to Least Resilient)

1. **Role-based**: `page.getByRole('button', { name: 'Submit' })` - Best for semantic HTML
2. **Label**: `page.getByLabel('Email')` - Perfect for form inputs
3. **Text**: `page.getByText('Welcome back')` - Good for headings/static content
4. **Placeholder**: `page.getByPlaceholder('Enter email')` - Inputs without labels
5. **Test ID**: `page.getByTestId('submit-btn')` - Stable but requires data-testid attributes
6. **CSS selectors**: `page.locator('.btn-primary')` - Avoid; breaks with styling changes

### When to Use Test IDs

Add `data-testid` attributes for:
- Critical user flows (checkout, login, signup)
- Complex components (data tables, multi-step forms)
- Elements where role-based selectors are ambiguous

```html
<button data-testid="checkout-submit">Complete Purchase</button>
```

```typescript
await page.getByTestId('checkout-submit').click();
```

## Playwright Codegen for Selector Discovery

**Playwright's built-in codegen is faster and more reliable than manual selector creation.**

### Using Codegen

```bash
# Start codegen from specific URL
npx playwright codegen https://your-app.com

# With authentication (loads saved state)
npx playwright codegen --load-storage=tests/.auth/user.json https://your-app.com

# Target specific browser
npx playwright codegen --browser=chromium https://your-app.com
```

**Workflow**:
1. Run codegen and interact with your application
2. Playwright generates test code with verified selectors
3. Copy generated selectors to your Page Objects
4. Refactor code to follow Page Object Model pattern
5. Extract reusable logic to fixtures and helpers

### Hybrid Approach: Codegen + AI Refactoring

```
1. Use Playwright codegen → Generates working test with selectors
2. Use AI (Claude) → Refactor to Page Objects, extract fixtures, add types
3. Best of both worlds: Reliability (codegen) + Intelligence (AI)
```

**Example**:
```typescript
// Raw codegen output
await page.goto('https://example.com/');
await page.getByLabel('Email').click();
await page.getByLabel('Email').fill('test@example.com');

// After AI refactoring into Page Object
class LoginPage {
  readonly emailInput = this.page.getByLabel('Email');

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }
}
```

## Smoke Test Strategy

**Smoke tests are a minimal suite of critical path tests that validate core functionality.**

### Characteristics

- **Fast**: Target < 5 minutes total execution time
- **Critical**: Cover must-work features (login, core user flows)
- **Stable**: High reliability, minimal flakiness
- **CI/CD**: Run on every commit/pull request

### Tagging Smoke Tests

```typescript
// tests/specs/auth/login.spec.ts
test('should login with valid credentials @smoke', async ({ page }) => {
  // Critical path test
});

test('should show error with invalid password', async ({ page }) => {
  // Not tagged - functional test only
});
```

### Running Smoke Tests

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# In CI/CD pipeline
npx playwright test --grep @smoke --workers=2

# Smoke tests as gate for full suite
npx playwright test --grep @smoke && npx playwright test
```

### Smoke Test Suite Example

```
@smoke test coverage:
✓ Login with valid credentials
✓ Navigate to dashboard
✓ Create new item (core feature)
✓ View item details
✓ Logout

Target: < 5 minutes, 100% pass rate
```

## Test Organization

### File Structure by Feature

```
tests/
├── specs/              # Tests organized by feature
│   ├── auth/
│   │   └── login.spec.ts
│   └── checkout/
│       └── purchase-flow.spec.ts
├── pages/              # Page Object Models
│   ├── LoginPage.ts
│   └── CheckoutPage.ts
├── components/         # Reusable UI components
├── fixtures/           # Custom test fixtures
├── helpers/            # Utility functions
└── setup/              # Global setup/teardown
```

### Test Structure with test.step()

**REQUIRED**: All tests must use `test.step()` to organize actions into high-level logical phases. This enables:
- Video navigation by step (users can jump to specific phases in test execution videos)
- Clear test structure and intent
- Granular error tracking (know exactly which phase failed)
- Better debugging with step-level timing

```typescript
test.describe('Purchase flow', () => {
  test.beforeEach(async ({ page }) => {
    // Common setup
  });

  test('should complete purchase with credit card', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await test.step('Add item to cart', async () => {
      await checkoutPage.addItemToCart('Product A');
      await expect(checkoutPage.cartCount).toHaveText('1');
    });

    await test.step('Navigate to checkout', async () => {
      await checkoutPage.goToCheckout();
      await expect(page).toHaveURL('/checkout');
    });

    await test.step('Fill payment information', async () => {
      await checkoutPage.fillPaymentInfo({
        cardNumber: '4111111111111111',
        expiry: '12/25',
        cvv: '123'
      });
    });

    await test.step('Submit order', async () => {
      await checkoutPage.submitOrder();
      await expect(page).toHaveURL('/confirmation');
    });

    await test.step('Verify order confirmation', async () => {
      await expect(checkoutPage.confirmationMessage).toBeVisible();
      await expect(checkoutPage.orderNumber).toContain('ORD-');
    });
  });
});
```

**Step Granularity Guidelines**:
- Target **3-7 steps per test** for optimal video navigation
- Each step should represent a logical phase (e.g., "Login", "Navigate to settings", "Update profile")
- Avoid micro-steps (e.g., "Click button", "Fill field") - group related actions
- Step titles should be user-friendly and descriptive

## Video-Synchronized Test Steps

**REQUIRED for all tests**: Use `test.step()` API to create video-navigable test execution.

### Why test.step() is Required

Every test generates a video recording with `steps.json` file containing:
- Step-by-step breakdown of test actions
- Video timestamps for each step (in seconds from test start)
- Step status (success/failed)
- Step duration

This enables users to:
- Click on a step to jump to that point in the video
- See exactly when and where a test failed
- Navigate through test execution like a timeline
- Debug issues by reviewing specific test phases

### test.step() Best Practices

```typescript
import { test, expect } from '@playwright/test';

test('user can update profile settings', async ({ page }) => {
  const settingsPage = new SettingsPage(page);
  const profilePage = new ProfilePage(page);

  await test.step('Navigate to settings page', async () => {
    await settingsPage.navigate();
    await expect(settingsPage.pageHeading).toBeVisible();
  });

  await test.step('Open profile section', async () => {
    await settingsPage.clickProfileTab();
    await expect(profilePage.nameInput).toBeVisible();
  });

  await test.step('Update profile information', async () => {
    await profilePage.updateName('John Doe');
    await profilePage.updateEmail('john@example.com');
  });

  await test.step('Save changes', async () => {
    await profilePage.clickSaveButton();
    await expect(profilePage.successMessage).toBeVisible();
  });

  await test.step('Verify changes persisted', async () => {
    await page.reload();
    await expect(profilePage.nameInput).toHaveValue('John Doe');
    await expect(profilePage.emailInput).toHaveValue('john@example.com');
  });
});
```

### What Gets Recorded in steps.json

```json
{
  "steps": [
    {
      "index": 1,
      "timestamp": "2025-11-17T09:26:22.335Z",
      "videoTimeSeconds": 0,
      "action": "Navigate to settings page",
      "status": "success",
      "description": "Navigate to settings page - completed successfully",
      "technicalDetails": "test.step",
      "duration": 1234
    },
    {
      "index": 2,
      "timestamp": "2025-11-17T09:26:23.569Z",
      "videoTimeSeconds": 1,
      "action": "Open profile section",
      "status": "success",
      "description": "Open profile section - completed successfully",
      "technicalDetails": "test.step",
      "duration": 856
    }
  ],
  "summary": {
    "totalSteps": 5,
    "successfulSteps": 5,
    "failedSteps": 0,
    "skippedSteps": 0
  }
}
```

### Step Naming Conventions

✅ **Good step names** (user-friendly, high-level):
- "Navigate to login page"
- "Login with valid credentials"
- "Add item to cart"
- "Complete checkout process"
- "Verify order confirmation"

❌ **Bad step names** (too technical, too granular):
- "Click the login button"
- "Fill email field"
- "Wait for page load"
- "Assert element visible"
- "page.goto('/login')"

### Smoke Test Example with test.step()

```typescript
// tests/specs/auth/login.spec.ts
test('should login and navigate through all main pages @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await test.step('Navigate to login page', async () => {
    await loginPage.navigate();
    await expect(loginPage.pageHeading).toBeVisible();
  });

  await test.step('Login with valid credentials', async () => {
    await loginPage.login(
      process.env.TEST_OWNER_EMAIL!,
      process.env.TEST_OWNER_PASSWORD!
    );
    await page.waitForURL(/.*\/dashboard/);
  });

  await test.step('Navigate to Overview page', async () => {
    await dashboardPage.navigateToOverview();
    await expect(dashboardPage.overviewNavLink).toBeVisible();
  });

  await test.step('Navigate to Settings page', async () => {
    await dashboardPage.navigateToSettings();
    await expect(dashboardPage.settingsNavLink).toBeVisible();
  });

  await test.step('Logout and verify redirect', async () => {
    await dashboardPage.logout();
    await page.waitForURL(/.*\/login/);
    await expect(loginPage.pageHeading).toBeVisible();
  });
});
```

## Authentication & Session Management

**Always authenticate once and reuse session state** across tests.

```typescript
// tests/setup/auth.setup.ts
import { test as setup } from '@playwright/test';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: authFile });
});
```

Configure in `playwright.config.ts`:

```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { storageState: 'tests/.auth/user.json' },
    dependencies: ['setup'],
  },
]
```

## Async Operations & Waiting

### Use Built-in Auto-waiting

Playwright automatically waits for elements to be:
- Visible
- Enabled
- Stable (not animating)
- Ready to receive events

```typescript
// ✅ GOOD: Auto-waiting
await page.click('#submit');
await expect(page.locator('.result')).toBeVisible();

// ❌ BAD: Manual arbitrary wait
await page.click('#submit');
await page.waitForTimeout(3000);
```

### Explicit Waiting (when needed)

```typescript
// Wait for element state
await page.locator('.loading').waitFor({ state: 'hidden' });

// Wait for URL change
await page.waitForURL('**/dashboard');

// Wait for network request
const response = await page.waitForResponse(
  resp => resp.url().includes('/api/data') && resp.status() === 200
);
```

## Common Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Approach |
|----------------|-------------------|
| `await page.waitForTimeout(3000)` | `await expect(element).toBeVisible()` |
| `const el = await page.$('.btn')` | `await page.locator('.btn').click()` |
| Tests depend on execution order | Each test is fully independent |
| Assertions in Page Objects | Assertions only in test files |
| `#app > div:nth-child(2) > button` | `page.getByRole('button', { name: 'Submit' })` |
| `retries: 5` to mask flakiness | `retries: 2` + fix root cause |

## Debugging Workflow

When a test fails:

1. **Reproduce locally**: `npx playwright test failing-test.spec.ts --headed`
2. **Enable trace**: `npx playwright test --trace on`
3. **View trace**: `npx playwright show-trace test-results/.../trace.zip`
4. **Identify failure**: Scrub timeline, check DOM snapshots
5. **Review network**: Look for failed API calls
6. **Check console**: JavaScript errors/warnings
7. **Fix selector**: Use inspector's locator picker
8. **Verify fix**: Run test 10 times to ensure stability

## API Testing for Speed

**Use API calls for test setup** (10-20x faster than UI):

```typescript
test('should display user dashboard', async ({ request, page }) => {
  // FAST: Create test data via API
  await request.post('/api/users', {
    data: { name: 'Test User', email: 'test@example.com' }
  });

  // UI: Test the actual user experience
  await page.goto('/dashboard');
  await expect(page.getByText('Test User')).toBeVisible();
});
```

## Configuration Essentials

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  timeout: 30000,
  expect: { timeout: 5000 },

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },
});
```

## Production-Ready Checklist

**Configuration:**
- [ ] Parallel execution enabled (`fullyParallel: true`)
- [ ] Retry strategy configured (2 in CI, 0 locally)
- [ ] Base URL from environment variables
- [ ] Artifact capture optimized (`on-first-retry`)

**Architecture:**
- [ ] Page Object Model for all major pages
- [ ] Component Objects for reusable UI elements
- [ ] Custom fixtures for common setup
- [ ] Tests organized by feature/user journey

**Best Practices:**
- [ ] No `waitForTimeout()` usage
- [ ] Tests are independent (run in any order)
- [ ] Assertions in test files, not Page Objects
- [ ] Role-based selectors prioritized
- [ ] No hardcoded credentials
- [ ] Framework validated with ONE working test before scaling
- [ ] Smoke tests tagged with @smoke for CI/CD
- [ ] All tests use `test.step()` for video-navigable execution (3-7 steps per test)

**Test Independence Validation:**
- [ ] Each test can run in isolation: `npx playwright test <single-test>`
- [ ] Tests pass in parallel: `npx playwright test --workers=4`
- [ ] Tests pass in random order: `npx playwright test --shard=1/3` (run multiple shards)
- [ ] No shared state between tests (each uses fixtures)
- [ ] Tests cleanup after themselves (via fixtures or API)

**CI/CD:**
- [ ] Smoke tests run on every commit (`npx playwright test --grep @smoke`)
- [ ] Full suite runs on pull requests
- [ ] Artifacts uploaded (reports, traces)
- [ ] Failure notifications configured
- [ ] Test results published to PR comments

---

**Remember**: The five critical pillars are:
1. **Two-Phase Approach** - Separate WHAT to test from HOW to automate
2. **Test One First** - Validate framework with ONE working test before scaling
3. **Page Object Model** - Isolate UI changes from test logic
4. **Role-based selectors** - Resist breakage with semantic HTML
5. **Authentication state reuse** - Maximize speed and reliability
