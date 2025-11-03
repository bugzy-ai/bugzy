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
```

## Testing

- Use Vitest for all tests
- Test files are located in `tests/` directory
- Run single test file: `pnpm test tests/path/to/file.test.ts`
- Tests cover: task generation, command generation, configuration validation, and integration scenarios

## Architecture

### Core System Design

Bugzy uses a **template-based code generation** architecture:

1. **Registry System** (`src/core/registry.ts`): Central coordinator that assembles complete agent configuration from task definitions and project subagents
2. **Task Builder** (`src/core/task-builder.ts`): Builds dynamic task definitions by injecting optional subagent blocks into base content using placeholders
3. **Generator Pipeline** (`src/cli/generators/`): Transforms configuration into files (.claude/commands/, .claude/agents/, .mcp.json)

### Key Concepts

**Task Templates** (`src/tasks/`):
- Define QA automation tasks (e.g., generate-test-plan, run-tests)
- Each template has `baseContent` with placeholders like `{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}`
- Placeholders are replaced with actual subagent blocks if configured, or removed if not

**Subagents** (`src/subagents/`):
- Specialized AI agents (Test Runner, Team Communicator, Documentation Researcher, Issue Tracker)
- Each subagent has metadata defining role, integrations, and required MCP servers
- Templates stored as markdown files in `src/subagents/templates/{role}/{integration}.md`

**MCP Configuration** (`src/mcp/`):
- Maps integrations (playwright, slack, notion) to MCP server configurations
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
  - .claude/.mcp.json (MCP server config)
  - .env.example (environment template)
```

### Task Building Process

When building a task definition:

1. Load task template from `TASK_TEMPLATES[slug]`
2. Validate required subagents are configured
3. For each optional subagent:
   - If configured: Replace `{{ROLE_NAME_INSTRUCTIONS}}` with contentBlock
   - If not configured: Replace placeholder with empty string
4. Derive required MCP servers from subagent integrations
5. Return complete TaskDefinition with processed content

## File Organization

```
src/
├── cli/                    # CLI entry point and commands
│   ├── commands/          # setup.ts, start.ts
│   ├── generators/        # File generators for .claude/ structure
│   └── utils/             # Config, validation, environment utilities
├── core/                  # Core coordination logic
│   ├── registry.ts        # Main agent configuration assembler
│   └── task-builder.ts    # Dynamic task definition builder
├── tasks/                 # Task library
│   ├── library/          # Individual task definitions
│   ├── templates/        # Shared content blocks
│   └── constants.ts       # TASK_SLUGS, TASK_TEMPLATES registry
├── subagents/            # Subagent system
│   ├── templates/        # Markdown templates per integration
│   ├── metadata.ts       # SUBAGENTS and INTEGRATIONS registry
│   └── index.ts          # Config builder
├── mcp/                  # MCP server configuration
│   └── index.ts          # MCP_SERVERS registry and config builder
└── index.ts              # Public API exports
```

## Important Implementation Details

### Placeholder System

Task templates use placeholders that are replaced at build time:
- Format: `{{ROLE_NAME_INSTRUCTIONS}}` (role in uppercase, hyphens → underscores)
- Example: `{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}`
- Replacement happens in `buildTaskDefinition()` in task-builder.ts

### Optional vs Required Subagents

- **Required**: Must be configured for task to work (e.g., test-runner)
- **Optional**: Enhance task functionality if configured (e.g., documentation-researcher)
- Task builder validates required subagents exist before building

### Environment Variable Handling

- CLI reads .env files in priority order: `.env.local` > `.env` > `.env.example`
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
2. Define baseContent with placeholders for optional subagents
3. Register in `src/tasks/constants.ts` TASK_TEMPLATES object
4. Add to exports in `src/tasks/index.ts`
5. Add tests in `tests/core/` or `tests/generators/`

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

## Type Safety

Key TypeScript interfaces:
- `TaskTemplate`: Complete task definition with baseContent and optional subagents
- `TaskDefinition`: Built task with processed content (placeholders replaced)
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
