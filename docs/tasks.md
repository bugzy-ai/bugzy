# Task Library

Bugzy provides a built-in library of QA automation tasks. These tasks are available as slash commands in Claude Code after running `bugzy setup`.

## Available Tasks

### generate-test-plan

**Command**: `/generate-test-plan`
**Description**: Generate a comprehensive test plan from a product description
**Required Subagents**: test-runner
**Optional Subagents**: documentation-researcher

**Purpose**: Create detailed test plans that cover all aspects of a feature or user flow. The task analyzes the product description, loads project context, and generates a structured test plan with scenarios, test cases, and expected results.

**Arguments**: `<product-description>`

**Usage**:
```
/generate-test-plan for user authentication with email and password
/generate-test-plan checkout flow including payment processing
```

**What It Does**:
1. Loads project context from `.bugzy/runtime/project-context.md`
2. Optionally searches documentation for related information
3. Analyzes the product description
4. Generates test scenarios covering happy paths and edge cases
5. Creates expected results for each scenario
6. Saves test plan to `.bugzy/runtime/test-plans/`

**Output**: Test plan markdown file with scenarios, test cases, and expected results

---

### generate-test-cases

**Command**: `/generate-test-cases`
**Description**: Generate specific executable test cases from a test plan
**Required Subagents**: test-runner
**Optional Subagents**: documentation-researcher

**Purpose**: Convert high-level test plans into concrete, executable test cases with step-by-step instructions. Each test case includes setup, actions, assertions, and teardown steps.

**Arguments**: `<test-plan-reference or description>`

**Usage**:
```
/generate-test-cases from the authentication test plan
/generate-test-cases for login with invalid credentials
```

**What It Does**:
1. Reads the test plan (from file or description)
2. Identifies testable scenarios
3. Creates detailed test cases with:
   - Setup steps (e.g., "Navigate to login page")
   - Action steps (e.g., "Enter invalid email")
   - Assertion steps (e.g., "Verify error message appears")
   - Teardown steps (e.g., "Clear session")
4. Includes test data and environment variables
5. Saves test cases to `.bugzy/runtime/test-cases/`

**Output**: Detailed test case files ready for execution

---

### explore-application

**Command**: `/explore-application`
**Description**: Explore and document an application's features and flows
**Required Subagents**: test-runner
**Optional Subagents**: documentation-researcher

**Purpose**: Systematically explore an application to understand its features, user flows, and behavior. Useful for new projects or undocumented features.

**Arguments**: `<area-to-explore>`

**Usage**:
```
/explore-application user dashboard
/explore-application admin panel
/explore-application checkout process
```

**What It Does**:
1. Opens the application in a browser
2. Navigates through the specified area
3. Documents discovered features and UI elements
4. Takes screenshots of key screens
5. Identifies user flows and interactions
6. Notes any issues or unexpected behavior
7. Creates documentation of findings

**Output**: Exploration report with screenshots and documentation

---

### run-tests

**Command**: `/run-tests`
**Description**: Execute automated tests
**Required Subagents**: test-runner
**Optional Subagents**: team-communicator, issue-tracker

**Purpose**: Run test cases using browser automation. Executes tests, captures results, takes screenshots on failures, and optionally reports issues.

**Arguments**: `<test-reference or description>`

**Usage**:
```
/run-tests for login flow
/run-tests from test-cases/auth-tests.md
/run-tests all checkout scenarios
```

**What It Does**:
1. Loads test cases (from file or creates from description)
2. Sets up test environment (loads env vars, prepares browser)
3. Executes each test case:
   - Performs setup steps
   - Executes test actions
   - Verifies assertions
   - Captures screenshots on failure
   - Performs teardown
4. Compiles test results
5. If failures and issue-tracker configured: Creates issues automatically
6. If team-communicator configured: Can send results to team

**Output**: Test execution report with pass/fail status and screenshots

---

### verify-changes-manual

**Command**: `/verify-changes-manual`
**Description**: Verify changes manually without notifications
**Required Subagents**: test-runner
**Optional Subagents**: None

**Purpose**: Execute verification tests for recent changes. Runs relevant tests and provides results without external notifications.

**Arguments**: `<changes-description>`

**Usage**:
```
/verify-changes-manual updated login form validation
/verify-changes-manual new payment gateway integration
```

**What It Does**:
1. Analyzes the changes description
2. Identifies affected features and flows
3. Runs relevant tests
4. Provides detailed results
5. Reports locally (no external notifications)

**Output**: Verification report with test results

---

### verify-changes-slack

**Command**: `/verify-changes-slack`
**Description**: Verify changes and notify team via Slack
**Required Subagents**: test-runner, team-communicator
**Optional Subagents**: issue-tracker

**Purpose**: Like verify-changes-manual but sends results to Slack. Useful for keeping the team informed about verification status.

**Arguments**: `<changes-description>`

**Usage**:
```
/verify-changes-slack deployed v2.3.0 to staging
/verify-changes-slack fixed checkout bug
```

**What It Does**:
1. Executes verification tests (same as verify-changes-manual)
2. Formats results as Slack message
3. Includes screenshots if there are failures
4. Posts to configured Slack channel
5. Optionally creates issues for failures

**Output**: Verification report + Slack notification

---

### handle-message

**Command**: `/handle-message`
**Description**: Process and respond to team messages
**Required Subagents**: None
**Optional Subagents**: team-communicator, documentation-researcher, issue-tracker

**Purpose**: Parse incoming messages (e.g., from Slack) and take appropriate action - run tests, look up documentation, create issues, etc.

**Arguments**: `<message-content>`

**Usage**:
```
/handle-message "Can someone test the new login page?"
/handle-message "Bug: checkout button not working on mobile"
```

**What It Does**:
1. Parses the message to understand intent
2. Takes appropriate action:
   - Test request → Runs tests
   - Bug report → Creates issue
   - Question → Searches documentation
   - Status request → Provides update
3. Responds with results

**Output**: Response based on message intent

---

### process-event

**Command**: `/process-event`
**Description**: Process external events (webhooks, CI/CD triggers, etc.)
**Required Subagents**: test-runner
**Optional Subagents**: team-communicator, issue-tracker

**Purpose**: Handle automated events like GitHub push, deploy complete, or scheduled runs. Determines what tests to run based on the event type.

**Arguments**: `<event-details>`

**Usage**:
```
/process-event github push to main branch
/process-event deployment completed to staging
/process-event scheduled nightly test run
```

**What It Does**:
1. Parses event details
2. Determines appropriate test suite:
   - Push to main → Full regression
   - PR opened → Changed features only
   - Deploy → Smoke tests
   - Scheduled → Full suite
3. Executes tests
4. Reports results

**Output**: Event processing report with test results

## Task Workflows

### Complete Test Generation and Execution

```
# 1. Generate test plan
/generate-test-plan for user registration

# 2. Generate test cases from plan
/generate-test-cases from the registration test plan

# 3. Run the tests
/run-tests for user registration
```

### Explore and Test New Feature

```
# 1. Explore the feature
/explore-application new dashboard widgets

# 2. Generate test plan based on exploration
/generate-test-plan for dashboard widgets based on exploration

# 3. Run tests
/run-tests for dashboard widgets
```

### Verify and Notify

```
# 1. Verify changes with Slack notification
/verify-changes-slack updated payment processing

# If issues found, they'll be auto-created in your issue tracker
```

## Task Customization

### Project Context

All tasks automatically load `.bugzy/runtime/project-context.md` for context. Update this file to provide tasks with project-specific information.

### Test Plan Template

Tasks use `.bugzy/runtime/templates/test-plan-template.md` as a template. Customize this to match your team's test plan format.

## Understanding Task Arguments

Tasks use `$ARGUMENTS` to capture everything after the command:

```
/generate-test-plan user authentication with OAuth
                    └─────────── $ARGUMENTS ────────────┘
```

You can be conversational:
```
/run-tests for the login flow and include edge cases
```

Or concise:
```
/run-tests login
```

Both work - the AI understands the intent.

## Task Requirements

### Required Files

Tasks expect this structure:
```
.bugzy/
├── runtime/
│   ├── project-context.md      # Project information
│   ├── templates/
│   │   └── test-plan-template.md
│   ├── test-plans/             # Generated by tasks
│   └── test-cases/             # Generated by tasks
```

### Environment Variables

Tasks read test configuration from `.env`:
```bash
# Required
TEST_BASE_URL=http://localhost:3000

# Optional but recommended
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpass123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=adminpass123
TEST_TIMEOUT=30000
TEST_HEADLESS=false
```

**Security Note**: Tasks read from `.env.example` for non-secret values and reference variable names from `.env` for secrets. Never hardcode passwords in test files.

## Best Practices

1. **Start with Exploration**: Use `/explore-application` for new features before writing tests
2. **Generate Before Running**: Create test plans and cases before execution
3. **Use Context**: Keep `.bugzy/runtime/project-context.md` updated
4. **Name Descriptively**: Use clear descriptions in arguments
5. **Verify After Changes**: Run `/verify-changes-slack` after deploys
6. **Automate Events**: Use `/process-event` for CI/CD integration

## Task Extensibility

While Bugzy OSS provides built-in tasks, you can:
1. **Customize templates**: Edit prompt templates in `.bugzy/runtime/templates/`
2. **Fork tasks**: Copy and modify task definitions (advanced)
3. **Request features**: Submit task requests to the Bugzy community

## Troubleshooting

### Task Not Found

**Problem**: "Task 'generate-test-plan' not found"

**Solution**: Run `bugzy setup` to regenerate task commands.

### Missing Subagent

**Problem**: "Required subagent 'test-runner' not configured"

**Solution**: Run `bugzy setup` and configure the required subagent.

### Test Execution Failed

**Problem**: Tests fail to execute or browser doesn't launch

**Solution**:
1. Verify `TEST_BASE_URL` is set in `.env`
2. Ensure application is running at that URL
3. Check Playwright is installed: `npm list -g | grep playwright`
4. Try running with `TEST_HEADLESS=false` to see what's happening

### File Not Found

**Problem**: "Cannot find test-plan.md"

**Solution**: Ensure you've generated the test plan first with `/generate-test-plan`.

## Next Steps

- Learn about [Subagents](./subagents.md) that power these tasks
- Review [Configuration](./configuration.md) for setup details
- Understand [Architecture](./architecture.md) to see how it all works
