# Project Memory

## Project Overview
**Type**: Test Management System
**Purpose**: Autonomous QA testing with AI-based test generation and execution

## SECURITY NOTICE

**CRITICAL: Never Read the .env File**

All agents, subagents, and slash commands must follow this security policy:

- **NEVER read the `.env` file** - It contains secrets, credentials, and sensitive data
- **ALWAYS use `.env.testdata`** instead - It contains only variable names, never actual values
- **Reference variables by name only** - e.g., TEST_BASE_URL, TEST_USER_EMAIL (never read the actual values)
- **This is enforced** - `.claude/settings.json` has `Read(.env)` in the deny list

When you need to know what environment variables are available:
1. Read `.env.testdata` to see variable names and structure
2. Reference variables by name in documentation and instructions
3. Trust that users will configure their own `.env` file from the example
4. Never attempt to access actual credential values

This policy applies to all agents, commands, and any code execution.

## Agent System

### Active Agents
<!-- AUTO-GENERATED: This section is populated during project creation -->
<!-- Configured agents will be listed here based on project setup -->

Agents configured for this project are stored in `.claude/agents/`. These are specialized sub-agents that handle specific domains. The active agents and their integrations will be configured during project setup.

### Agent Memory Index
<!-- AUTO-GENERATED: Agent memory files are created during project setup -->

Specialized memory files for domain experts will be created in `.bugzy/runtime/memory/` based on configured agents.

## Project Structure

### Core Components
- **Test Plan**: `test-plan.md` - Generated via `/generate-test-plan` command using template
- **Test Cases**: `./test-cases/` - Individual test case files generated via `/generate-test-cases`
- **Exploration Reports**: `./exploration-reports/` - Structured reports from application exploration sessions
- **Knowledge Base**: `.bugzy/runtime/knowledge-base.md` - Curated knowledge about the project (maintained using `.bugzy/runtime/knowledge-maintenance-guide.md`)
- **Issue Tracking**: Managed by issue-tracker agent in your configured project management system
- **Runtime**: `.bugzy/runtime/` - Project-specific runtime files:
  - `memory/` - Agent memory and knowledge base files
  - `templates/` - Document templates for test plan generation
  - `knowledge-base.md` - Accumulated insights
  - `project-context.md` - **CRITICAL**: Project SDLC, team information, QA workflow, and testing guidelines
- **MCP Configuration**: `.bugzy/.mcp.json` - Template with all available MCP server configurations

### Available Commands
1. `/generate-test-plan` - Generate comprehensive test plan from product documentation using the documentation-researcher agent
2. `/explore-application` - Systematically explore the application to discover UI elements, workflows, and behaviors, updating test plan with findings
3. `/generate-test-cases` - Create E2E browser test cases (exploratory, functional, regression, smoke) based on documentation and test plan
4. `/run-tests` - Execute test cases using the browser-automation agent
5. `/handle-message` - Process team responses and manage ongoing conversations with the product team using the team-communicator agent

### Git Workflow

**Git operations are now handled automatically by the execution environment.**

Agents and commands should NOT perform git operations (commit, push). Instead:

1. **Focus on core work**: Agents generate files and execute tests
2. **External service handles git**: After task completion, the Cloud Run environment:
   - Commits all changes with standardized messages
   - Pushes to the remote repository
   - Handles authentication and errors

**Files Automatically Committed**:
- `test-plan.md` - Test planning documents
- `.env.testdata` - Environment variable templates
- `./test-cases/*.md` - Individual test case files
- `./exploration-reports/*.md` - Application exploration findings
- `.bugzy/runtime/knowledge-base.md` - Accumulated testing insights
- `.bugzy/runtime/memory/*.md` - Agent memory and knowledge base
- `CLAUDE.md` - Updated project context (when modified)
- `.bugzy/runtime/project-context.md` - Project-specific runtime context

**Git-Ignored Files** (NOT committed):
- `.env` - Local environment variables with secrets
- `logs/` - Temporary log files
- `tmp/` - Temporary files
- `.playwright-mcp/` - Playwright videos (uploaded to GCS separately)
- `node_modules/` - Node.js dependencies

### Workflow

#### Testing Workflow
1. Generate test plan: `/generate-test-plan` command leverages the documentation-researcher agent to gather requirements
2. Explore application: `/explore-application --focus [area] --depth [shallow|deep]` discovers actual UI elements and behaviors
3. Create test cases: `/generate-test-cases --type [type] --focus [feature]` uses discovered documentation and exploration findings
4. Execute tests: `/run-tests [test-id|type|tag|all]` runs test cases via browser-automation agent
5. Continuous refinement through exploration and test execution

### Testing Lifecycle Phases
1. **Initial Test Plan Creation** - From product documentation
2. **Application Exploration** - Systematic discovery via `/explore-application`
3. **Test Case Generation** - Stored as individual files with actual UI elements
4. **Test Execution** - Automated runs via `/run-tests`
5. **Continuous Refinement** - Through exploration and test execution
6. **Regression Testing** - Scheduled or triggered execution

## Key Project Insights
<!-- Critical discoveries and patterns that apply across all domains -->

## Cross-Domain Knowledge

### Project Context Usage
The `.bugzy/runtime/project-context.md` file contains critical project information that MUST be referenced by:
- All agents during initialization to understand project specifics
- All commands before processing to align with project requirements
- Any custom implementations to maintain consistency

Key information includes: QA workflow, story status management, bug reporting guidelines, testing environment details, and SDLC methodology.

### Test Execution Standards

**Automated Test Execution** (via `/run-tests` command):
- Test runs are stored in hierarchical structure: `./test-runs/YYYYMMDD-HHMMSS/TC-XXX/exec-N/`
- Each test run session creates:
  - `execution-id.txt`: Contains BUGZY_EXECUTION_ID for session tracking
  - `manifest.json`: Overall run metadata with all test cases and executions
  - Per test case folders (`TC-001-login/`, etc.) containing execution attempts
- Each execution attempt (`exec-1/`, `exec-2/`, `exec-3/`) contains:
  - `result.json`: Playwright test result format with status, duration, errors, attachments
  - `steps.json`: Step-by-step execution with video timestamps (if test uses `test.step()`)
  - `video.webm`: Video recording (copied from Playwright's temp location)
  - `trace.zip`: Trace file (only for failures)
  - `screenshots/`: Screenshots directory (only for failures)
- Videos are recorded for ALL tests, traces/screenshots only for failures
- Custom Bugzy reporter handles all artifact organization automatically
- External service uploads videos from execution folders to GCS

**Step-Level Tracking** (Automated Tests):
- Tests using `test.step()` API generate steps.json files with video timestamps
- Each step includes timestamp and videoTimeSeconds for easy video navigation
- High-level steps recommended (3-7 per test) for manageable navigation
- Steps appear in both result.json (Playwright format) and steps.json (user-friendly format)
- Tests without `test.step()` still work but won't have steps.json

**Manual Test Execution** (via browser-automation agent):
- Manual test cases use separate format: `./test-runs/YYYYMMDD-HHMMSS/TC-XXX/`
- Each test run generates:
  - `summary.json`: Structured test result with video filename reference
  - `steps.json`: Step-by-step execution with timestamps and video synchronization
- Video recording via playwright-cli --save-video flag
- Videos remain in `.playwright-mcp/` folder - external service uploads to GCS

**General Rules**:
- NO test-related files should be created in project root
- DO NOT copy, move, or delete video files manually
- DO NOT CREATE ANY SUMMARY, REPORT, OR ADDITIONAL FILES unless explicitly requested
<!-- Additional cross-domain information below -->
