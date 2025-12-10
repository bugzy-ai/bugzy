# Bugzy

[![npm version](https://img.shields.io/npm/v/@bugzy-ai/bugzy.svg)](https://www.npmjs.com/package/@bugzy-ai/bugzy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/node/v/@bugzy-ai/bugzy.svg)](https://nodejs.org)

> Open-source AI agent configuration for QA automation

Bugzy is a CLI tool that manages AI agent configuration for your AI coding assistant, providing properly configured subagents, tasks, and MCP servers for test automation.

## Supported Tools

| Tool | Status | Description |
|------|--------|-------------|
| **Claude Code** | Recommended | Anthropic's official CLI - full feature support |
| **Cursor** | Experimental | VS Code-based AI editor |
| **Codex CLI** | Experimental | OpenAI's terminal-based agent |

> **Note**: Cursor and Codex support is experimental. Some features may not work as expected. Claude Code is the recommended and fully tested option.

## Features

- ✅ **Complete Task Library** - 8 pre-built QA automation tasks
- ✅ **Flexible Subagents** - Test Runner, Test Code Generator, Test Debugger & Fixer, Team Communicator, Documentation Researcher, Issue Tracker
- ✅ **Easy Setup** - Interactive CLI configuration (`bugzy setup`)
- ✅ **Local Execution** - Runs entirely on your machine with Claude Code
- ✅ **Version Control Friendly** - Configuration stored in git-friendly files
- ✅ **Language Agnostic** - Works with any project type (Python, Ruby, Go, JavaScript, etc.)
- ✅ **No Vendor Lock-in** - Full control over customization
- ✅ **MCP Integration** - Automatic MCP server configuration

## Quick Start

```bash
# Install globally
npm install -g @bugzy-ai/bugzy

# Navigate to your project
cd my-project

# Run interactive setup
bugzy setup

# Configure your MCP secrets
cp .env.example .env
vim .env  # Add your MCP API tokens (Slack, Notion, etc.)

# Generate test plan (creates .env.testdata with test data)
bugzy "/generate-test-plan for [your feature]"

# Start a Claude Code session
bugzy
```

## Example Usage

```bash
# Generate a test plan
bugzy "generate test plan for user authentication"

# Or use slash commands in Claude Code
/generate-test-plan for checkout flow
/run-tests for payment processing
/verify-changes deployed new feature
```

## What Gets Created

After running `bugzy setup`, your project will have:

```
your-project/
├── .bugzy/
│   ├── config.json              # Your subagent configuration (includes selected tool)
│   └── runtime/
│       ├── project-context.md   # Project information
│       └── templates/           # Customizable templates
├── .<tool>/                     # Tool-specific directory (.claude/, .cursor/, or .codex/)
│   ├── commands/                # Task commands (or prompts/ for Codex)
│   ├── agents/                  # Configured subagent prompts
│   └── mcp.json                 # MCP server configuration
├── .env.example                 # MCP secrets template (empty values)
├── .env.testdata                # Test data with actual values (from /generate-test-plan)
└── .env                         # Your actual secrets (gitignored)
```

> **Note**: The directory structure varies by tool. Claude Code uses `.claude/`, Cursor uses `.cursor/`, and Codex uses `.codex/`.

## Available Subagents

| Subagent | Purpose | Integrations | Required |
|----------|---------|--------------|----------|
| **Test Runner** | Execute automated browser tests | Playwright | ✅ Yes |
| **Test Code Generator** | Generate Playwright test scripts and Page Objects | Playwright | ✅ Yes |
| **Test Debugger & Fixer** | Debug and fix failing tests automatically | Playwright | ✅ Yes |
| **Team Communicator** | Send team notifications | Slack, Teams, Email, Local (CLI) | ✅ Yes (auto-configured) |
| **Documentation Researcher** | Search documentation | Notion | ❌ Optional |
| **Issue Tracker** | Create and track bugs | Jira Server, Notion, Slack | ❌ Optional |

## Available Tasks

| Task | Command | Description |
|------|---------|-------------|
| Explore Application | `/explore-application` | Explore and document application features |
| Generate Test Plan | `/generate-test-plan` | Create comprehensive test plans |
| Generate Test Cases | `/generate-test-cases` | Generate executable test cases |
| Run Tests | `/run-tests` | Execute automated tests and analyze failures |
| Verify Changes | `/verify-changes` | Verify product changes via automated testing |
| Onboard Testing | `/onboard-testing` | Complete workflow: explore → plan → cases → test → fix → report |
| Handle Message | `/handle-message` | Process team messages from Slack/Teams |
| Process Event | `/process-event` | Handle automated webhooks and events |

## Configuration

Bugzy uses a simple configuration format:

```json
{
  "version": "1.0.0",
  "tool": "claude-code",
  "project": {
    "name": "my-project"
  },
  "subagents": {
    "test-runner": "playwright",
    "team-communicator": "slack",
    "documentation-researcher": "notion",
    "issue-tracker": "jira-server"
  }
}
```

The `tool` field can be `"claude-code"` (default), `"cursor"` (experimental), or `"codex"` (experimental).

**Don't edit `config.json` manually** - use `bugzy setup` to reconfigure.

> **Note**: When using CLI (`bugzy`), the `team-communicator` is automatically configured to use terminal-based communication. No setup required.

## Environment Variables

Bugzy loads environment variables for MCP servers and test configuration:

```bash
# MCP Secrets
SLACK_BOT_TOKEN=xoxb-...
NOTION_TOKEN=secret_...
RESEND_API_KEY=re_...

# Test Configuration
TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=secure-password
```

See [Configuration Guide](./docs/configuration.md) for complete details.

## Documentation

- 📚 [Getting Started Guide](./docs/getting-started.md) - Installation and first-time setup
- ⚙️ [Configuration Guide](./docs/configuration.md) - Subagent and environment setup
- 🤖 [Subagents Guide](./docs/subagents.md) - Available subagents and integrations
- 📋 [Task Library](./docs/tasks.md) - All available tasks and usage
- 🏗️ [Architecture](./docs/architecture.md) - How Bugzy works under the hood

## Examples

Check out example configurations:
- [Basic Setup](./examples/basic/) - Minimal configuration with just Test Runner
- [Full Setup](./examples/full/) - All subagents configured

## Requirements

- **Node.js** v18 or higher
- **AI Coding Tool**: One of the following installed and configured:
  - **Claude Code** (recommended) - Anthropic's official CLI
  - **Cursor** (experimental) - VS Code-based AI editor
  - **Codex CLI** (experimental) - OpenAI's terminal-based agent
- **npm** or **yarn** package manager

## Breaking Changes (v0.2.0)

### New Test Execution Output Format

**This is a breaking change.** Bugzy now uses a hierarchical test execution format with custom Playwright reporter:

**What's New:**
- **Custom Bugzy Reporter**: Automatically creates `test-runs/YYYYMMDD-HHMMSS/` structure with `manifest.json`
- **Execution Retries**: Tracks multiple attempts per test (`exec-1/`, `exec-2/`, `exec-3/`)
- **Comprehensive Artifacts**: Videos for all tests, traces/screenshots for failures only
- **Manifest Format**: New `manifest.json` provides complete test run summary and per-test execution details

**Migration Path:**
1. Update to v0.2.0: `npm update -g bugzy`
2. Run `bugzy setup` in your project to regenerate configuration files
3. New files will be created:
   - `playwright.config.ts` - Uses custom Bugzy reporter
   - `reporters/bugzy-reporter.ts` - Custom reporter implementation
   - `.bugzy/runtime/templates/test-result-schema.md` - Complete schema documentation

**Key Changes:**
- `/run-tests` now reads `manifest.json` instead of `.last-run.json`
- Test artifacts organized in `test-runs/{timestamp}/{testId}/exec-{num}/` structure
- Environment variable `BUGZY_EXECUTION_NUM` controls retry attempts
- Videos recorded for ALL tests (not just failures)
- Trace/screenshots only for failures (more efficient)

See `.bugzy/runtime/templates/test-result-schema.md` for complete format documentation.

## Reconfiguration

Need to change your setup? Just run:

```bash
bugzy setup
```

Bugzy will detect your existing configuration and allow you to make changes.

## Troubleshooting

### Command Not Found

```bash
npm install -g @bugzy-ai/bugzy
```

### Missing Secrets

```
✗ Missing required MCP secrets: SLACK_BOT_TOKEN
```

Add the missing secret to your `.env` file.

### AI Tool Not Found

Install your selected AI coding tool and ensure it's in your PATH:
- **Claude Code**: Install from [claude.ai/code](https://claude.ai/code)
- **Cursor**: Install from [cursor.com](https://cursor.com)
- **Codex CLI**: Install from [OpenAI](https://github.com/openai/codex)

See the [Getting Started Guide](./docs/getting-started.md) for more troubleshooting tips.

## FAQ

**Q: Do I need a package.json?**
A: No! Bugzy works with any project type.

**Q: Can I use this with Python/Ruby/Go projects?**
A: Yes! Bugzy is language-agnostic.

**Q: Where are my secrets stored?**
A: In `.env` which is gitignored. `.env.example` (MCP secrets template) and `.env.testdata` (test data) are committed.

**Q: Can I customize the tasks?**
A: You can customize templates in `.bugzy/runtime/templates/`.

**Q: How do I update to get new tasks?**
A: Run `npm update -g @bugzy-ai/bugzy && bugzy setup`

## License

MIT © Bugzy Team

## Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon).

## Support

- **Issues**: [github.com/bugzy-ai/bugzy/issues](https://github.com/bugzy-ai/bugzy/issues)
- **Discussions**: [github.com/bugzy-ai/bugzy/discussions](https://github.com/bugzy-ai/bugzy/discussions)
- **Documentation**: [docs.bugzy.dev](https://docs.bugzy.dev)
