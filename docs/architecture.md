# Architecture

This document explains how Bugzy works under the hood, from setup to task execution.

## System Overview

```
┌─────────────┐
│   User      │
│  (You)      │
└─────┬───────┘
      │
      │ bugzy setup / bugzy start
      ▼
┌──────────────────────┐
│   Bugzy CLI          │
│  - Setup Command     │
│  - Start Command     │
└──────┬───────────────┘
       │
       │ generates (tool-specific)
       ▼
┌──────────────────────┐        ┌──────────────────────┐
│  .bugzy/             │        │  .<tool>/            │
│  - config.json       │◄──────►│  - commands/         │
│  - runtime/          │   reads │  - agents/           │
│                      │         │  - mcp.json          │
└──────────────────────┘         └──────┬───────────────┘
                                        │
                                        │ loads
                                        ▼
                              ┌──────────────────────┐
                              │   AI Coding Tool     │
                              │  - Claude Code       │
                              │  - Cursor (exp.)     │
                              │  - Codex CLI (exp.)  │
                              └──────┬───────────────┘
                                     │
                                     │ calls
                                     ▼
                            ┌──────────────────────┐
                            │   MCP Servers        │
                            │  - Playwright        │
                            │  - Slack             │
                            │  - Notion            │
                            │  - etc.              │
                            └──────────────────────┘
```

> **Note**: The `.<tool>/` directory is `.claude/`, `.cursor/`, or `.codex/` depending on your selected tool. Cursor and Codex support is experimental.

## Core Components

### 1. Bugzy CLI

The command-line interface that manages your Bugzy configuration.

**Location**: `src/cli/`

**Commands**:
- `bugzy setup` - Interactive configuration wizard
- `bugzy` - Start your AI coding tool with Bugzy configuration

**Responsibilities**:
- Load and save configuration
- Generate tool-specific task commands
- Generate subagent configurations
- Generate MCP configuration
- Validate environment variables
- Launch the configured AI coding tool (Claude Code, Cursor, or Codex)

### 2. Task Library

Collection of pre-built QA automation tasks.

**Location**: `src/tasks/`

**Structure**:
```typescript
interface TaskTemplate {
  slug: string;
  name: string;
  description: string;
  frontmatter: TaskFrontmatter;
  promptTemplate: (subagents: SubAgentConfig) => string;
}
```

**Responsibilities**:
- Define task behavior
- Specify required/optional subagents
- Generate task prompts with subagent blocks injected

### 3. Subagent System

Specialized AI agents with specific capabilities.

**Location**: `src/subagents/`

**Structure**:
```typescript
interface SubAgentMetadata {
  role: string;
  name: string;
  description: string;
  integrations: SubAgentIntegration[];
  isRequired?: boolean;
}
```

**Responsibilities**:
- Define subagent capabilities
- Specify required MCP servers
- Provide templates for injection into tasks

### 4. MCP Configuration

Manages Model Context Protocol server configuration.

**Location**: `src/mcp/`

**Responsibilities**:
- Generate MCP config for the selected tool (JSON or TOML format)
- Configure server commands and arguments
- Map environment variables to MCP servers

### 5. Tool Profile System

Manages tool-specific configurations for different AI coding assistants.

**Location**: `src/core/tool-profile.ts`

**Supported Tools**:
- **Claude Code** (recommended) - Full feature support
- **Cursor** (experimental) - VS Code-based editor
- **Codex CLI** (experimental) - OpenAI's terminal agent

**Responsibilities**:
- Define directory structures per tool (`.claude/`, `.cursor/`, `.codex/`)
- Configure MCP format (JSON for Claude Code/Cursor, TOML for Codex)
- Set command invocation prefixes (`/` vs `/prompts:`)
- Handle frontmatter requirements per tool

### 6. Generator Pipeline

Transforms configuration into files.

**Location**: `src/cli/generators/`

**Flow**:
```
Configuration (.bugzy/config.json)
         │
         ├──► Commands Generator ──► .<tool>/commands/*.md
         ├──► Agents Generator   ──► .<tool>/agents/*.md
         ├──► MCP Generator      ──► .<tool>/mcp.json
         ├──► Env Generator      ──► .env.testdata
         └──► Structure Generator ──► .bugzy/runtime/
```

> **Note**: `.<tool>/` is `.claude/`, `.cursor/`, or `.codex/` depending on your selected tool.

## Execution Flow

### Setup Flow

```
1. User runs: bugzy setup

2. CLI checks for existing .bugzy/config.json
   ├─ Exists: Reconfiguration mode
   └─ Missing: First-time setup mode

3. Select AI coding tool:
   - Claude Code (recommended)
   - Cursor (experimental)
   - Codex CLI (experimental)

4. Interactive prompts for each subagent:
   - Test Runner (required)
   - Team Communicator (optional)
   - Documentation Researcher (optional)
   - Issue Tracker (optional)

5. Save configuration to .bugzy/config.json

6. Generate all files:
   ├─ Create .bugzy/runtime/ structure
   ├─ Generate task commands (.<tool>/commands/)
   ├─ Generate subagent configs (.<tool>/agents/)
   ├─ Generate MCP config (.<tool>/mcp.json)
   └─ Generate .env.testdata template

7. Update .gitignore if needed

8. Report success and next steps
```

### Start Flow

```
1. User runs: bugzy [optional-prompt]

2. Load .bugzy/config.json
   └─ Validate configuration exists

3. Validate project structure
   ├─ Check .bugzy/ directory
   ├─ Check .<tool>/ directory
   └─ Check required files

4. Load environment variables
   ├─ Read .env.local (if exists)
   ├─ Read .env (if exists)
   └─ Read .env.testdata (fallback)

5. Validate required MCP secrets
   └─ Check each configured integration has required env vars

6. Launch AI coding tool:
   ├─ Set working directory to project root
   ├─ Export environment variables
   └─ Execute: <tool-cli> [optional-prompt]

7. AI coding tool starts with Bugzy configuration
```

### Task Execution Flow

```
1. User types: /generate-test-plan user authentication
   (or /prompts:generate-test-plan for Codex)

2. AI tool loads: .<tool>/commands/generate-test-plan.md

3. Task prompt includes:
   ├─ Task instructions
   ├─ Injected subagent blocks
   │   ├─ <test_runner> block (if configured)
   │   ├─ <team_communicator> block (if configured)
   │   └─ <documentation_researcher> block (if configured)
   └─ User arguments ($ARGUMENTS = "user authentication")

4. AI tool executes task:
   ├─ Reads project context (.bugzy/runtime/project-context.md)
   ├─ Uses subagent capabilities (MCP tools)
   │   ├─ Test Runner: Browser automation
   │   ├─ Team Communicator: Send messages
   │   └─ Documentation Researcher: Search docs
   ├─ Generates test plan
   └─ Saves to .bugzy/runtime/test-plans/

5. Reports completion to user
```

## Task Building Process

When a task is loaded, Bugzy builds the complete task definition:

```typescript
function buildTaskDefinition(
  template: TaskTemplate,
  subagents: SubAgentConfig
): TaskDefinition {
  // 1. Validate required subagents are present
  for (const required of template.frontmatter.requiredSubAgents) {
    if (!subagents[required]) {
      throw new Error(`Required subagent ${required} not configured`);
    }
  }

  // 2. Build subagent blocks map
  const subagentBlocks = {};
  for (const [role, config] of Object.entries(subagents)) {
    subagentBlocks[role] = config.block; // Template content
  }

  // 3. Generate task content with injected blocks
  const content = template.promptTemplate(subagentBlocks);

  // 4. Return complete task definition
  return {
    slug: template.slug,
    frontmatter: template.frontmatter,
    content: content
  };
}
```

## Configuration Management

### Configuration File (.bugzy/config.json)

```json
{
  "version": "1.0.0",
  "tool": "claude-code",
  "project": {
    "name": "my-project"
  },
  "subagents": {
    "test-runner": "playwright",
    "team-communicator": "slack"
  }
}
```

The `tool` field can be `"claude-code"` (default), `"cursor"` (experimental), or `"codex"` (experimental).

**Why This Format?**
- Simple: Just role → integration mapping
- Maintainable: Easy to understand and edit (via bugzy setup)
- Extensible: Can add new roles without breaking changes
- Version-controlled: Team can share configuration

### Template System

Bugzy uses a template-based approach for both tasks and subagents:

**Task Templates** (TypeScript):
```typescript
{
  slug: 'generate-test-plan',
  promptTemplate: (subagents) => `
    # Generate Test Plan

    ${subagents['test-runner']?.block || ''}
    ${subagents['documentation-researcher']?.block || ''}

    Generate comprehensive test plan...
  `
}
```

**Subagent Templates** (Markdown files):
```markdown
# Playwright Test Runner

You are a test automation expert...

## Available Tools
- playwright_navigate
- playwright_click
- ...
```

**Benefits**:
- Separation of concerns (logic vs content)
- Easy to update templates without code changes
- Version-controllable
- Understandable by non-developers

## MCP Integration

Bugzy generates MCP configuration for your AI coding tool. The format depends on the selected tool:

**Claude Code / Cursor (JSON format)**:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "mcp-server-playwright",
      "args": ["--browser", "chromium", "--headless"],
      "env": {}
    },
    "slack": {
      "command": "slack-mcp-server",
      "args": [],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}"
      }
    }
  }
}
```

**Codex CLI (TOML format via CLI)**:
```bash
codex mcp add playwright -- mcp-server-playwright --browser chromium --headless
codex mcp add slack -- slack-mcp-server
```

**Environment Variable Substitution**:
- `"${SLACK_BOT_TOKEN}"` → The AI tool reads from shell environment
- Bugzy loads `.env` files and exports to shell before launching
- MCP servers receive environment variables at runtime

## File Organization

### User's Project Structure

```
my-project/
├── .bugzy/                          # Bugzy configuration
│   ├── config.json                  # Internal config (CLI-managed)
│   └── runtime/                     # User-editable runtime files
│       ├── project-context.md       # Project information
│       ├── templates/               # User-customizable templates
│       │   └── test-plan-template.md
│       ├── test-plans/              # Generated test plans
│       └── test-cases/              # Generated test cases
├── .<tool>/                         # Tool-specific configuration
│   ├── commands/                    # Task commands (generated)
│   │   ├── generate-test-plan.md
│   │   ├── run-tests.md
│   │   └── ... (8 tasks)
│   ├── agents/                      # Subagent configs (generated)
│   │   ├── test-runner.md
│   │   ├── team-communicator.md
│   │   └── ...
│   └── mcp.json                     # MCP configuration (generated)
├── .env.testdata                     # Environment template (generated)
├── .env                             # Secrets (user-created, gitignored)
└── .gitignore                       # Updated by Bugzy
```

> **Note**: `.<tool>/` is `.claude/`, `.cursor/`, or `.codex/` depending on your selected tool.

### Bugzy Package Structure

```
bugzy/ (npm package)
├── dist/                            # Compiled code
│   ├── cli/
│   │   ├── index.js                 # CLI entry point
│   │   ├── commands/
│   │   ├── generators/
│   │   └── utils/
│   ├── core/
│   ├── tasks/
│   ├── subagents/
│   └── mcp/
├── templates/                       # Scaffolding templates
│   └── init/
│       ├── .bugzy/runtime/
│       │   ├── project-context.md
│       │   └── templates/
│       │       └── test-plan-template.md
│       └── .gitignore-template
├── src/                             # Source code (not in package)
└── package.json
```

## Security Model

### Secret Management

**Principles**:
1. **Never commit secrets** - `.env` is gitignored
2. **Template for sharing** - `.env.testdata` is committed
3. **Variable substitution** - MCP config uses `${VAR}` references
4. **Runtime injection** - Secrets loaded at execution time

**Flow**:
```
.env (secrets)
     │
     ├──► Bugzy CLI reads
     │
     └──► Exports to shell environment
            │
            └──► AI coding tool inherits
                   │
                   └──► MCP servers access via ${VAR}
```

### File Access

Tasks are instructed to:
- ✅ Read `.env.testdata` for non-secret values
- ❌ Never read `.env` file (secrets only)
- ✅ Reference variable names for secrets (e.g., `$TEST_USER_PASSWORD`)

## Extensibility

### Adding New Tasks

1. Create task definition in `src/tasks/library/`
2. Register in `src/tasks/index.ts`
3. Build and publish new version
4. Users run `npm update -g bugzy && bugzy setup`

### Adding New Subagents

1. Create template in `src/subagents/templates/`
2. Add metadata to `src/subagents/metadata.ts`
3. Build and publish new version
4. Users run `npm update -g bugzy && bugzy setup`

### Adding New Integrations

1. Add integration to `INTEGRATIONS` in metadata
2. Add to subagent's `integrations` array
3. Update MCP configuration generator if needed
4. Build and publish new version

## Design Decisions

### Why CLI Instead of Web UI?

- **Version Control**: Configuration in git alongside code
- **Simplicity**: No server infrastructure needed
- **Portability**: Works on any machine with Node.js
- **Privacy**: All data stays local
- **Speed**: No network latency

### Why Markdown Templates?

- **Readable**: Non-developers can understand and modify
- **Version Control**: Diffs are meaningful
- **Portable**: Works across all tools
- **Flexible**: Supports rich formatting

### Why Separate .bugzy/ and .<tool>/?

- `.bugzy/` - Bugzy-specific (config, runtime files)
- `.<tool>/` - Tool-specific (commands, agents, MCP) - e.g., `.claude/`, `.cursor/`, `.codex/`
- **Benefit**: Clear separation of concerns
- **Benefit**: Tool directory can be regenerated safely

### Why JSON for Config?

- **Standard**: Widely understood format
- **Tooling**: Great editor support
- **Strict**: Type-safe with schemas
- **Simple**: Easy to parse and validate

## Performance Considerations

### Setup Performance

Setup is intentionally thorough but not optimized for speed because it runs infrequently:
- Generates all task commands (8 files)
- Generates subagent configs (1-4 files)
- Generates MCP config (1 file)
- Total time: ~1-2 seconds

### Start Performance

Start is optimized for speed (runs every session):
- Quick validation checks
- Fast environment loading
- Minimal file I/O
- Total time: ~100-200ms

## Next Steps

- Read [Getting Started](./getting-started.md) to use Bugzy
- Review [Configuration](./configuration.md) for setup details
- Explore [Tasks](./tasks.md) to see what's available
- Learn about [Subagents](./subagents.md) that power tasks
