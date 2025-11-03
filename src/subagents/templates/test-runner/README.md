# Test Runner Agent

## Purpose
Executes test case files against live applications through automated browser testing. This agent performs comprehensive test execution with detailed logging, screenshot capture, and result documentation.

## Abstract Interface

### Core Capabilities
The test runner agent must provide these capabilities regardless of the underlying automation framework:

1. **Test Execution**
   - Parse and execute test case files
   - Navigate through application workflows
   - Interact with UI elements
   - Handle dynamic page content
   - Manage test data and variables

2. **Evidence Collection**
   - Capture screenshots at each step
   - Record browser console logs
   - Track network requests/responses
   - Document timing information
   - Save page state and HTML

3. **Validation and Verification**
   - Compare actual vs expected behavior
   - Perform visual validations
   - Check for JavaScript errors
   - Validate element states
   - Verify data integrity

4. **Environment Management**
   - Load and use environment variables
   - Handle different test environments
   - Manage browser configurations
   - Support multiple browsers
   - Configure viewport and devices

5. **Result Documentation**
   - Generate detailed test logs
   - Create execution summaries
   - Document findings and issues
   - Produce test metrics
   - Organize test artifacts

## Expected Inputs

- **Test Case File**:
  - Path to test case markdown file
  - Test ID and description
  - Test steps with actions
  - Expected behaviors
  - Test data requirements

- **Environment Configuration**:
  - `.env` file with test variables
  - Base URLs and endpoints
  - User credentials
  - API keys and tokens
  - Timeout configurations

- **Execution Options**:
  - Browser selection
  - Viewport dimensions
  - Screenshot preferences
  - Debug mode settings
  - Retry configurations

## Expected Outputs

- **Test Results**:
  - Overall status (PASS/FAIL/BLOCKED)
  - Step-by-step execution details
  - Actual behaviors observed
  - Deviations from expected
  - Error messages and stack traces

- **Test Artifacts** (in `./test-runs/<timestamp>/<test-id>/`):
  - `test-log.md`: Detailed execution log
  - `summary.json`: Test metrics and outcome
  - `screenshots/`: Step-by-step images
  - `browser-logs.txt`: Console output
  - `findings.md`: Issues and observations
  - `error-details.json`: Error information

## Memory Management

Test runner agents are typically stateless for each execution, but may maintain:

### Configuration Cache
- Environment variable mappings
- Browser preferences
- Common selectors
- Wait strategies

### Execution Patterns
- Common element locator strategies
- Typical wait conditions
- Error recovery approaches
- Performance benchmarks

## Available Implementations

| Implementation | Automation Framework | Required MCP/Tools |
|---------------|---------------------|-------------------|
| `puppeteer.md` | Puppeteer | `mcp__puppeteer__*` |
| `playwright.md` | Playwright | Playwright MCP (future) |
| `selenium.md` | Selenium WebDriver | Selenium MCP (future) |
| `cypress.md` | Cypress | Cypress MCP (future) |

## Usage Examples

```markdown
# Execute a specific test case
Use test-runner agent to:
1. Load test case from ./test-cases/TC-001-login.md
2. Set up browser with 1920x1080 viewport
3. Execute all test steps
4. Capture screenshots and logs
5. Generate test report

# Run regression test suite
Use test-runner agent to:
1. Execute multiple test cases sequentially
2. Use production environment variables
3. Generate consolidated report
4. Flag any failures for investigation

# Validate bug fix
Use test-runner agent to:
1. Run failing test case
2. Verify fix resolves the issue
3. Document verification results
4. Update bug report with findings
```

## Setup Instructions

To use this agent in your project:
1. Choose the implementation matching your automation framework
2. Copy the implementation file to `.claude/agents/test-runner.md`
3. Configure the required MCP server or tools
4. Set up `.env` file with test variables
5. Create test case files in `./test-cases/` directory

## Environment Variable Handling

The agent supports variable replacement in test cases:
- `${TEST_BASE_URL}` → Replaced with actual URL from .env
- `${TEST_USER_EMAIL}` → Replaced with test user email
- `${TEST_USER_PASSWORD}` → Replaced with test password
- All `TEST_*` prefixed variables are available

Example `.env` file:
```
TEST_BASE_URL=https://app.example.com
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=secure123
TEST_API_KEY=api_key_here
TEST_TIMEOUT=30000
```

## Implementation Guidelines

Each implementation should:
- Handle environment variable replacement consistently
- Capture comprehensive evidence at each step
- Continue execution after non-critical failures
- Generate standardized output formats
- Clean up resources after execution
- Support both headless and headed modes
- Provide intelligent wait strategies
- Handle dynamic content gracefully