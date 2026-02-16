# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bugzy is an open-source CLI tool that manages AI agent configuration for QA automation. It generates Claude Code configuration files (slash commands, subagents, MCP servers) based on user-selected integrations. The package is designed to be installed globally via npm and run in any project directory.

## Development Commands

```bash
# Build the project
pnpm build

# Watch mode for development
pnpm dev

# Run all tests
pnpm test

# Run tests in CI mode (single run)
pnpm test:ci

# Type checking (always run before committing)
pnpm type-check

# Lint the code
pnpm lint

# Publish to npmjs
npm publish
```

## Publishing

The package is published to npmjs as a public scoped package (`@bugzy-ai/bugzy`).

**Full Release Process:**
1. Bump version: `npm version patch|minor|major --no-git-tag-version`
2. Build: `pnpm build`
3. Publish: `npm publish`
4. Commit changes: `git add . && git commit -m "chore: Release vX.X.X"`
5. Push: `git push`

## Testing

- Use Vitest for all tests
- Test files are located in `tests/` directory
- Run single test file: `pnpm test tests/path/to/file.test.ts`
- Tests cover: task generation, command generation, configuration validation, and integration scenarios

## Architecture

### Core System Design

Bugzy uses a **step-based composition** architecture:

1. **Registry System** (`src/core/registry.ts`): Central coordinator that assembles complete agent configuration from task definitions and project subagents
2. **Task Builder** (`src/core/task-builder.ts`): Builds dynamic task definitions from composable steps with conditional subagent injection
3. **Generator Pipeline** (`src/cli/generators/`): Transforms configuration into files (.claude/commands/, .claude/agents/, .mcp.json)

### Key Concepts

**Task Templates** (`src/tasks/`):
- Define QA automation tasks (8 tasks: explore-application, generate-test-plan, generate-test-cases, run-tests, verify-changes, onboard-testing, handle-message, process-event)
- Each template uses a `steps: TaskStep[]` array for composable execution
- Steps can be inline content, library references, or conditional on subagent configuration

**Step Library** (`src/tasks/steps/`):
- Reusable step definitions organized by category
- Categories: setup/, exploration/, clarification/, execution/, generation/, communication/, maintenance/
- Each step exports a `LibraryStep` with id, title, and content

**Subagents** (`src/subagents/`):
- 6 specialized AI agents:
  - Required: browser-automation, test-engineer, team-communicator (with email fallback)
  - Optional: documentation-researcher, issue-tracker, changelog-historian
- Each subagent has metadata defining role, integrations, and required MCP servers
- Templates stored as TypeScript files in `src/subagents/templates/{role}/{integration}.ts`

**MCP Configuration** (`src/mcp/`):
- Maps integrations (playwright, slack, teams, notion, jira-server, resend) to MCP server configurations
- Environment variables like `${SLACK_BOT_TOKEN}` are expanded by Claude Code at runtime

### Configuration Flow

```
User runs: bugzy setup
  ↓
Interactive prompts select subagents
  ↓
Save to .bugzy/config.json
  ↓
Generate files:
  - .claude/commands/*.md (8 task commands)
  - .claude/agents/*.md (configured subagents)
  - .mcp.json (MCP server config)
  - .env.example (MCP secrets template - empty values)
  - .env.testdata (created by /generate-test-plan - test data with actual values)
```

### Task Building Process

When building a task definition:

1. Load task template from `TASK_TEMPLATES[slug]`
2. Validate required subagents are configured
3. Process each step in the `steps` array:
   - **String step**: Load step content from library (`src/tasks/steps/`)
   - **Inline step**: Use the content directly
   - **Conditional step**: Include only if the specified subagent is configured
4. Inject subagent blocks where referenced in step content
5. Derive required MCP servers from subagent integrations
6. Return complete TaskDefinition with assembled content

## File Organization

```
src/
├── cli/                    # CLI entry point and commands
│   ├── commands/          # setup.ts, start.ts
│   ├── generators/        # File generators for .claude/ structure
│   └── utils/             # Config, validation, environment utilities
├── core/                  # Core coordination logic
│   ├── registry.ts        # Main agent configuration assembler
│   ├── task-builder.ts    # Dynamic task definition builder
│   ├── tool-profile.ts    # Tool-specific configurations
│   └── tool-strings.ts    # Invocation placeholder replacement
├── tasks/                 # Task library
│   ├── library/          # 8 task definitions (composed)
│   ├── steps/            # Reusable step library
│   │   ├── setup/        # Project context, security notices
│   │   ├── exploration/  # Quick, moderate, deep exploration
│   │   ├── clarification/ # Ambiguity detection, questions
│   │   ├── execution/    # Test running, result parsing
│   │   ├── generation/   # Test plan and case generation
│   │   ├── communication/ # Team notifications
│   │   └── maintenance/  # Cleanup, reporting
│   ├── templates/        # Shared content blocks
│   └── constants.ts       # TASK_SLUGS registry
├── subagents/            # Subagent system
│   ├── templates/        # TypeScript templates per integration
│   ├── metadata.ts       # SUBAGENTS and INTEGRATIONS registry
│   └── index.ts          # Config builder
├── mcp/                  # MCP server configuration
│   └── index.ts          # MCP_SERVERS registry and config builder
└── index.ts              # Public API exports
```

## Important Implementation Details

### Step-Based Composition

Tasks use composable steps instead of monolithic templates:

**Step Types:**
```typescript
type TaskStep =
  | string                        // Library step ID (e.g., 'security-notice')
  | { inline: true; title: string; content: string }  // Inline content
  | { stepId: string; conditionalOnSubagent: string }; // Conditional
```

**Example Task Definition:**
```typescript
{
  slug: 'run-tests',
  steps: [
    { inline: true, title: 'Overview', content: '...' },
    'security-notice',           // Library step
    'read-knowledge-base',       // Library step
    'run-tests',                 // Library step
    'parse-test-results',        // Library step
    {
      stepId: 'log-product-bugs',
      conditionalOnSubagent: 'issue-tracker'  // Only if configured
    }
  ],
  requiredSubagents: ['browser-automation', 'test-engineer'],
  optionalSubagents: ['team-communicator', 'issue-tracker']
}
```

### Required vs Optional Subagents

**CRITICAL DISTINCTION:**

- **Required Subagents** (4): Must ALWAYS be configured for task to work
  - `browser-automation`, `test-engineer` - Core test automation
  - `team-communicator` - Falls back to email if Slack/Teams not configured
  - Listed in `requiredSubagents` array for validation
  - Their steps are always included in task execution

- **Optional Subagents** (2): User choice, task works without them
  - `documentation-researcher` - Search Notion for context
  - `issue-tracker` - Create issues for bugs
  - Use conditional steps: `{ stepId: '...', conditionalOnSubagent: 'role' }`
  - Step only included if subagent is configured

### Environment Variable Handling

- CLI reads .env files in priority order: `.env.local` > `.env` > `.env.testdata` > `.env.example`
- `.env.example`: MCP secrets template (empty values, for reference)
- `.env.testdata`: Test data with actual non-secret values (created by /generate-test-plan task)
- `.env`: User's actual secrets and overrides
- `.env.local`: Local overrides (highest priority)
- Variables exported to shell before launching Claude Code
- MCP config uses `${VAR}` syntax, expanded by Claude Code at runtime

## Package Structure

This is a dual-purpose package:
1. **NPM package**: Installed globally via `npm install -g bugzy`
2. **CLI tool**: Executable via `bugzy` command after global install

Build output:
- `dist/` contains compiled JavaScript
- `dist/cli/index.js` is the CLI entry point (shebang: `#!/usr/bin/env node`)
- `templates/` directory is copied to dist for scaffolding

## Common Tasks

### Adding a New Task

1. Create task definition in `src/tasks/library/new-task.ts`
2. Define steps array using library steps and inline content
3. Use conditional steps for optional subagent functionality
4. Register in `src/tasks/constants.ts` TASK_SLUGS object
5. Add to exports in `src/tasks/index.ts`
6. Add tests in `tests/core/` or `tests/generators/`

### Adding a New Step

1. Create step definition in appropriate category: `src/tasks/steps/{category}/new-step.ts`
2. Export a `LibraryStep` with id, title, and content
3. Register in `src/tasks/steps/index.ts`
4. Reference from tasks using the step ID string

### Adding a New Subagent Integration

1. Add integration to `INTEGRATIONS` in `src/subagents/metadata.ts`
2. Create template file in `src/subagents/templates/{role}/{integration}.md`
3. Add integration to appropriate subagent's integrations array
4. Update MCP configuration in `src/mcp/index.ts` if new MCP server needed

### Adding New Content Blocks

Reusable content blocks are in `src/tasks/templates/`:
- `clarification-instructions.ts` - Used in message/event handling tasks
- `exploration-instructions.ts` - Used in exploration tasks
- `verify-changes-core.ts` - Core verification workflow

## Slash Command Authoring Rules

Distilled from `docs/claude-code-slash-command-best-practices.md` — always-in-context reference for the step composition pipeline.

### Step Authoring

- `TaskStep` fields: `id` (kebab-case), `title`, `content`, `category` (required); `requiresSubagent`, `invokesSubagents`, `tags` (optional)
- Categories: `security`, `setup`, `exploration`, `clarification`, `execution`, `generation`, `communication`, `maintenance`
- Use `{{STEP_NUMBER}}` in content for auto-numbering; use `$ARGUMENTS` for user input
- Never reference specific tools (Slack, Jira, email) — use `{{INVOKE_*}}` placeholders
- `requiresSubagent` gates step inclusion; `invokesSubagents` drives MCP derivation — they serve different purposes
- Single responsibility per step; reuse across tasks via step ID

### Task Composition

- `ComposedTaskTemplate` needs: `slug`, `name`, `description`, `frontmatter`, `steps[]`, `requiredSubagents`; optional: `optionalSubagents`, `dependentTasks`
- Step types: `string` (library ID) | `{ stepId, conditionalOnSubagent }` | `{ inline: true, title, content }`
- Use `conditionalOnSubagent` for optional functionality — never hardcode subagent presence
- Required subagents = always present, steps always included; Optional = gated via conditional steps
- Steps are auto-numbered — array ordering determines execution flow

### Frontmatter (`TaskFrontmatter`)

```
description: string       # Required — shown in /help and discoverability
argument-hint?: string    # Documents expected params (e.g., "<test-plan-file>")
allowed-tools?: string    # Only for manually-authored commands
name?: string             # Override display name
```

### Invocation Placeholders

Defined in `src/core/tool-strings.ts`, replaced at generation time per tool profile (Claude Code / Cursor / Codex):

```
{{INVOKE_BROWSER_AUTOMATION}}         {{INVOKE_TEST_ENGINEER}}
{{INVOKE_TEAM_COMMUNICATOR}}
{{INVOKE_ISSUE_TRACKER}}              {{INVOKE_DOCUMENTATION_RESEARCHER}}
{{INVOKE_CHANGELOG_HISTORIAN}}
```

### Command Design Best Practices

- **Single responsibility** — one well-defined purpose per command; make intent obvious from the name
- **Structured instructions** — use numbered steps for workflows, separate concerns into sections, include clear success criteria
- **Context provision** — document expected starting state, list prerequisites, reference relevant files
- **Tool specification** — only request necessary tools in `allowed-tools`, prefer specific permissions over wildcards
- **Argument documentation** — provide clear `argument-hint`, document expected format, show examples in description
- **Consistent formatting** — use Markdown headings for structure, code blocks for examples, lists for steps
- **Error handling** — include validation steps, specify what to do on failure, provide clear error messages

### Anti-patterns

- Referencing Slack/Teams/email directly in steps → use `{{INVOKE_TEAM_COMMUNICATOR}}`
- Skipping `conditionalOnSubagent` for optional subagent steps → errors when subagent not configured
- Overly broad steps → split into focused, reusable units
- Missing `description` in frontmatter → command invisible in `/help`
- Confusing `requiresSubagent` (gate) with `invokesSubagents` (MCP derivation)

## Type Safety

Key TypeScript interfaces:
- `ComposedTaskTemplate`: Task definition with steps array and subagent requirements
- `TaskStep`: Union type for inline, library, or conditional steps
- `LibraryStep`: Reusable step definition with id, title, content
- `TaskDefinition`: Built task with processed content
- `ProjectSubAgent`: User's configured subagent (role + integration)
- `AgentConfiguration`: Complete config for Claude Code (MCP + commands + subagents)

## Testing Strategy

Tests are organized by concern:
- `tests/core/`: Task building, registry, integration scenarios
- `tests/generators/`: File generation validation
- `tests/utils/`: Config loading, validation utilities

Integration tests validate complete workflows (e.g., `task-generation-integration.test.ts` tests full task building with various subagent configurations).

## Build Process

Uses tsup for building:
- Entry points: `src/index.ts` (library), `src/cli/index.ts` (CLI)
- Outputs: ESM (`.js`), CommonJS (`.cjs`), TypeScript declarations (`.d.ts`)
- CLI entry point marked executable with shebang

## Requirements

- Node.js ≥ 18.0.0
- pnpm for package management
- TypeScript 5.3+
