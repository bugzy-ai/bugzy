# Test Execution Strategy

## Overview

This document defines the test execution strategy for the Bugzy QA system, explaining **which tests to run when** and **why**. All agents and commands executing tests should reference this document to make intelligent decisions about test selection.

## Test Architecture Pattern

Our test suite follows a **pyramid testing strategy** where test cases can have multiple test implementations:

- **Comprehensive E2E Tests**: Full user journey from start to finish (tagged `@smoke`)
- **Granular Component Tests**: Isolated validation of specific capabilities (tagged `@component` or `@fast`)

**Example**: TC-003 (Project Settings Update) has:
- 1 comprehensive E2E test covering all 20 manual steps
- 2 granular tests covering navigation (steps 1-8) and field display (steps 1-10)

## Test Tiers

### Tier 1: Smoke Tests (`@smoke`)

**Purpose**: Quick validation of critical user journeys

**Coverage**:
- Comprehensive E2E tests only
- One test per test case
- 100% manual test case coverage
- **Zero redundancy**

**Execution Time**: ~2-5 minutes for full smoke suite

**When to Use**:
- **Default for most test runs**
- Every commit and pull request
- Quick validation after code changes
- Before starting new development work
- Continuous integration (CI) on every push
- Post-deployment verification

**Command**:
```bash
npx playwright test --grep "@smoke"
```

**Why This Tier**:
- Fast feedback loop
- Full coverage of critical paths
- No wasted execution time on redundant tests
- Ideal for frequent validation

---

### Tier 2: Component Tests (`@component` or `@fast`)

**Purpose**: Isolated component validation for debugging

**Coverage**:
- Granular tests for specific capabilities only
- Navigation, form display, API calls, etc.
- Subset coverage (e.g., just steps 1-8 for navigation)
- Skips comprehensive E2E tests

**Execution Time**: ~1-3 minutes (faster than smoke)

**When to Use**:
- Debugging specific component failures
- After refactoring a specific component
- When you need to verify a single capability without running full E2E
- Rapid iteration during development
- Targeted validation after component-level bug fixes

**Command**:
```bash
npx playwright test --grep "@component"
# OR
npx playwright test --grep "@fast"
```

**Why This Tier**:
- Ultra-fast feedback for specific areas
- Avoids running unnecessary setup/teardown
- Ideal for focused development work

---

### Tier 3: Full Regression (All Tests)

**Purpose**: Complete validation including redundant component tests

**Coverage**:
- Smoke tests (comprehensive E2E)
- Component tests (granular isolation)
- **Intentional redundancy** for diagnostic value

**Execution Time**: ~10-15 minutes

**When to Use**:
- Weekly scheduled CI runs
- Before major releases or deployments
- After significant refactoring across multiple areas
- When comprehensive validation is required
- Pre-merge validation for large features
- Monthly regression testing cycles

**Command**:
```bash
npx playwright test
# OR explicitly
npx playwright test --grep ".*"
```

**Why This Tier**:
- **Fast failure isolation**: If Settings page breaks, component test fails in 15 seconds vs E2E failing after 30 seconds
- **Component-level confidence**: Proves each capability works independently
- **Refactoring safety**: If you refactor save logic, component tests prove navigation/display still work
- **Comprehensive validation**: Catches edge cases that isolated tests might miss

**Understanding Redundancy**:
- Example: TC-003 login steps (1-5) run in all 3 tests
- **Cost**: Extra 30 seconds execution time
- **Benefit**: Instant failure location (know exactly which component broke)
- **Trade-off**: Worth it for regression scenarios, not for daily validation

---

## Default Behavior

### When User Provides No Selector

**Default Action**: Run `@smoke` tests

**Rationale**:
- Provides fast feedback (2-5 min vs 10-15 min)
- Full coverage of critical user journeys
- Zero redundancy = no wasted time
- Suitable for 90% of test execution scenarios

**User Communication**:
```
Running smoke tests (@smoke) for quick validation.
For comprehensive regression including component tests, use 'all'.
For specific areas, provide test file pattern or tag.
```

### When User Says "All"

**Action**: Run full regression suite (all tests)

**User Communication**:
```
Running full regression suite including component tests.
This includes intentional redundancy for diagnostic value and will take longer (~10-15 min).
```

---

## Context-Based Selection Logic

Parse user intent from their natural language request:

### Fast Validation Context

**Keywords**: "quick", "validate", "sanity check", "verify", "check"

**Action**: Run `@smoke` tests

**Examples**:
- "Quick check if login still works"
- "Validate the settings page"
- "Sanity test before I start work"

---

### Comprehensive Validation Context

**Keywords**: "full", "comprehensive", "regression", "all", "everything", "complete"

**Action**: Run all tests

**Examples**:
- "Full regression before release"
- "Comprehensive validation of the system"
- "Run everything to be sure"

---

### Debugging/Focused Context

**Keywords**: "debug", "check [specific area]", "[component name]", "just [feature]"

**Action**: Run specific test file or pattern

**Examples**:
- "Debug the settings page" → Run `TC-003` or pattern `settings`
- "Check authentication only" → Run pattern `auth` or `TC-001`
- "Just test the navigation" → Run `@component` tests

---

### Ambiguous Context

**When**: No clear keywords or selector provided

**Action**: Default to `@smoke` and inform user of options

**User Communication**:
```
No test selection specified. Running smoke tests (@smoke) by default.

Available options:
- '@smoke' - Quick validation (2-5 min, default)
- '@component' - Component tests only (1-3 min)
- 'all' - Full regression (10-15 min)
- '[pattern]' - Specific tests matching pattern
```

---

## Tag Taxonomy

### Primary Tags

| Tag | Purpose | Coverage | Speed |
|-----|---------|----------|-------|
| `@smoke` | Critical E2E journeys | Comprehensive, 100% manual test coverage | Medium (30-60s/test) |
| `@component` | Isolated component validation | Partial, specific capability only | Fast (10-20s/test) |
| `@fast` | Alias for `@component` | Same as @component | Fast |
| `@regression` | Full regression suite | All tests (smoke + component) | Slow (full suite) |

### Domain Tags (for filtering by feature area)

| Tag | Feature Area |
|-----|--------------|
| `@authentication` | Login, logout, session management |
| `@project-management` | Project CRUD, settings |
| `@test-management` | Test cases, test runs, activity feed |
| `@settings` | Settings pages and persistence |
| `@navigation` | Navigation and routing |
| `@data-persistence` | Data saving and loading |

### Combining Tags

**Multiple tags on same test**:
```typescript
test('should update settings and persist @smoke @project-management @settings', ...)
```

**Run tests matching multiple criteria**:
```bash
# Smoke tests in project management area
npx playwright test --grep "@smoke.*@project-management"

# All settings-related tests (smoke + component)
npx playwright test --grep "@settings"
```

---

## Time and Coverage Trade-offs

### Execution Time Comparison

| Tier | Tests Run | Time | Use Frequency |
|------|-----------|------|---------------|
| Smoke (`@smoke`) | ~6 tests | 2-5 min | Daily (90%) |
| Component (`@component`) | ~8 tests | 1-3 min | As needed (5%) |
| Full Regression (all) | ~15 tests | 10-15 min | Weekly (5%) |

### Coverage vs Speed Matrix

```
High Coverage ┐
              │
              │        ┌─ Full Regression
              │        │  (High coverage, slower)
              │        │
              │   ┌────┘
              │   │
              │   │ Smoke Tests
              │   │ (High coverage, faster)
              │   │
              ├───┼─────────────────────►
              │   │                    Fast
              │   │
              │   └─ Component Tests
              │      (Partial coverage, fastest)
              │
Low Coverage  ┘
```

### Recommendation by Scenario

| Scenario | Recommended Tier | Rationale |
|----------|------------------|-----------|
| Developer commit | Smoke | Fast feedback, full coverage |
| Pull request CI | Smoke | Balance speed and confidence |
| Pre-deployment | Full Regression | Comprehensive validation |
| Debugging component | Component or specific file | Fastest feedback for focused area |
| Weekly CI schedule | Full Regression | Diagnostic redundancy value |
| Post-hotfix | Smoke | Quick validation of critical paths |

---

## Example Scenarios

### Scenario 1: Developer Makes Code Change

**Context**: Developer updates Settings page form validation

**User Request**: `/run-tests` (no selector)

**Agent Decision**:
- Read this strategy file
- No selector provided → Default to `@smoke`
- Run: `npx playwright test --grep "@smoke"`
- Result: 6 tests in ~3 min, full E2E coverage, zero redundancy

**Communication**:
```
Running smoke tests (@smoke) for quick validation...
✓ 6/6 tests passed in 3m 12s
All critical user journeys validated successfully.
```

---

### Scenario 2: Pre-Release Validation

**User Request**: `/run-tests all`

**Agent Decision**:
- Explicit "all" keyword → Run full regression
- Run: `npx playwright test`
- Result: 15 tests in ~12 min, includes redundant component tests

**Communication**:
```
Running full regression suite including component tests...
This includes intentional redundancy for diagnostic value (~10-15 min).

✓ 15/15 tests passed in 12m 34s
Full regression validation complete:
- 6 comprehensive E2E tests (smoke)
- 9 component-level tests
All tests passed.
```

---

### Scenario 3: Debugging Settings Page Failure

**User Request**: `/run-tests settings`

**Agent Decision**:
- File pattern provided → Match specific tests
- Run: `npx playwright test settings`
- Result: Runs TC-003 (3 tests: 1 smoke + 2 component)

**Communication**:
```
Running tests matching pattern "settings"...
Found: tests/specs/project-management/TC-003-project-settings-update.spec.ts

Results:
✓ should update project settings and persist changes @smoke
✗ should navigate to settings page @component
  └─ Error: Navigation timeout
✓ should display project name and description @component

Failure isolated to navigation component. Settings form display works correctly.
```

---

### Scenario 4: Quick Validation Request

**User Request**: "Can you quickly check if the login flow still works?"

**Agent Decision**:
- Keyword "quickly" → Use `@smoke`
- Implicit focus on "login" → Could run specific test or full smoke
- Run: `npx playwright test --grep "@smoke"` (include all smoke, not just login)
- Result: 6 tests including login in ~3 min

**Communication**:
```
Running smoke tests (@smoke) for quick validation of all critical flows including login...

✓ 6/6 tests passed in 3m 8s
All critical user journeys validated, including:
- TC-001: Login and navigation ✓
- TC-003: Project settings update ✓
- TC-004: Test cases page access ✓
- TC-005: Test runs page access ✓
- TC-006: Session management ✓
- TC-008: Activity feed access ✓
```

---

## Understanding Test Redundancy

### What is Redundant Coverage?

Some test suites contain multiple tests that exercise the same functionality:

**Example: TC-003 (Project Settings Update)**

```
Test 1 (E2E, @smoke): Steps 1-20 (login → navigate → update → verify)
Test 2 (Component, @component): Steps 1-8 (login → navigate)  ← Overlaps with Test 1
Test 3 (Component, @component): Steps 1-10 (login → navigate → display) ← Overlaps with Test 1
```

**Overlap**: Steps 1-8 run in all 3 tests

### Why Allow Redundancy?

**Diagnostic Value**:
- If Test 2 fails but Test 1 passes → Issue is isolated to navigation
- If Test 3 fails but Tests 1 & 2 pass → Issue is in form display
- If Test 1 fails but Tests 2 & 3 pass → Issue is in update/save logic (steps 11-20)

**Speed Benefit**:
- Test 2 fails in 15 seconds (just navigation)
- Test 1 fails in 30 seconds (full E2E including navigation)
- **Saved time**: 15 seconds to identify failure point

### When is Redundancy Worth It?

**Smoke Runs**: NOT worth it (90% of executions)
- Goal: Fast validation
- Trade-off: Skip redundant tests, accept slower failure diagnosis

**Full Regression Runs**: Worth it (10% of executions)
- Goal: Comprehensive validation with diagnostic value
- Trade-off: Accept 30 extra seconds for faster failure isolation
- Context: Pre-release, weekly CI, post-refactoring

---

## Integration with Other Systems

### Test Generation (`/generate-test-cases`)

When generating new test cases, the generator should:
1. Create comprehensive E2E test with `@smoke` tag
2. Optionally create component tests with `@component` or `@fast` tags
3. Apply appropriate domain tags (`@authentication`, `@project-management`, etc.)

### CI/CD Pipelines

Recommended pipeline configuration:

```yaml
# On every PR - SMOKE ONLY
on_pull_request:
  npx playwright test --grep "@smoke"
  # Fast validation: 2-5 min

# Nightly regression - ALL TESTS
on_schedule:
  npx playwright test
  # Comprehensive validation: 10-15 min

# Pre-deployment - SMOKE (fast gate)
on_deployment:
  npx playwright test --grep "@smoke"
  # Critical path validation: 2-5 min
```

### Issue Tracking

When tests fail, triage results should consider:
- Smoke test failures → High priority (critical path broken)
- Component test failures (when smoke passes) → Medium priority (isolated issue)
- Component test failures (when smoke also fails) → Confirms root cause

---

## Decision Tree for Agents

```
User provides selector?
├─ Yes
│  ├─ Selector is "all" or "everything"?
│  │  └─ Run: npx playwright test (Full Regression)
│  ├─ Selector is tag (starts with @)?
│  │  └─ Run: npx playwright test --grep "[tag]"
│  ├─ Selector is file pattern (e.g., "auth", "settings")?
│  │  └─ Run: npx playwright test [pattern]
│  └─ Selector is specific file path?
│     └─ Run: npx playwright test [file-path]
└─ No selector provided
   ├─ User request contains context keywords?
   │  ├─ "quick", "validate", "sanity" → Run: @smoke
   │  ├─ "full", "comprehensive", "regression" → Run: all tests
   │  └─ "debug [area]", "check [component]" → Run: specific pattern
   └─ No context keywords
      └─ Default: Run @smoke and inform user of options
```

---

## Maintenance Notes

### When to Update This Strategy

This document should be updated when:
- New test tiers are introduced
- Tag taxonomy changes
- Execution time significantly changes
- New testing patterns emerge
- CI/CD pipeline requirements change

### Related Documents

- `.bugzy/runtime/testing-best-practices.md` - How to write tests (test patterns)
- `.bugzy/runtime/knowledge-base.md` - Accumulated testing insights
- `.claude/commands/run-tests.md` - Test execution command (mechanics)
- `playwright.config.ts` - Playwright configuration
- Test cases in `./test-cases/` - Individual test case documentation

---

## Summary

**Key Principles**:
1. **Default to smoke tests** for fast validation (90% of runs)
2. **Use component tests** for focused debugging
3. **Run full regression** only when diagnostic redundancy is needed (10% of runs)
4. **Parse user context** to choose the right tier intelligently
5. **Communicate clearly** about what's running and why

**Remember**: The goal is to provide fast feedback most of the time, while maintaining the ability to run comprehensive validation when needed. Redundancy is intentional but conditional.
