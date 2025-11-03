# Bugzy

[![npm version](https://img.shields.io/npm/v/bugzy.svg)](https://www.npmjs.com/package/bugzy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/node/v/bugzy.svg)](https://nodejs.org)

> Open-source AI agent configuration for QA automation with Claude Code

Bugzy is a CLI tool that manages AI agent configuration and starts Claude Code sessions with properly configured subagents, tasks, and MCP servers for test automation.

## Features

- ✅ **Complete Task Library** - 8 pre-built QA automation tasks
- ✅ **Flexible Subagents** - Test Runner, Team Communicator, Documentation Researcher, Issue Tracker
- ✅ **Easy Setup** - Interactive CLI configuration (`bugzy setup`)
- ✅ **Local Execution** - Runs entirely on your machine with Claude Code
- ✅ **Version Control Friendly** - Configuration stored in git-friendly files
- ✅ **Language Agnostic** - Works with any project type (Python, Ruby, Go, JavaScript, etc.)
- ✅ **No Vendor Lock-in** - Full control over customization
- ✅ **MCP Integration** - Automatic MCP server configuration

## Quick Start

```bash
# Install globally
npm install -g bugzy

# Navigate to your project
cd my-project

# Run interactive setup
bugzy setup

# Configure your environment
cp .env.example .env
vim .env  # Add your API tokens

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
/verify-changes-slack deployed new feature
```

## What Gets Created

After running `bugzy setup`, your project will have:

```
your-project/
├── .bugzy/
│   ├── config.json              # Your subagent configuration
│   └── runtime/
│       ├── project-context.md   # Project information
│       └── templates/           # Customizable templates
├── .claude/
│   ├── commands/                # 8 task slash commands
│   ├── agents/                  # Configured subagent prompts
│   └── .mcp.json                # MCP server configuration
├── .env.example                 # Environment template
└── .env                         # Your secrets (gitignored)
```

## Available Subagents

| Subagent | Purpose | Integrations | Required |
|----------|---------|--------------|----------|
| **Test Runner** | Execute automated tests | Playwright | ✅ Yes |
| **Team Communicator** | Send team notifications | Slack | ❌ Optional |
| **Documentation Researcher** | Search documentation | Notion, Confluence | ❌ Optional |
| **Issue Tracker** | Create and track bugs | Linear, Jira, Notion, Slack | ❌ Optional |

## Available Tasks

| Task | Command | Description |
|------|---------|-------------|
| Generate Test Plan | `/generate-test-plan` | Create comprehensive test plans |
| Generate Test Cases | `/generate-test-cases` | Generate executable test cases |
| Explore Application | `/explore-application` | Document application features |
| Run Tests | `/run-tests` | Execute automated tests |
| Verify Changes (Manual) | `/verify-changes-manual` | Verify changes locally |
| Verify Changes (Slack) | `/verify-changes-slack` | Verify and notify team |
| Handle Message | `/handle-message` | Process team messages |
| Process Event | `/process-event` | Handle automated events |

## Configuration

Bugzy uses a simple configuration format:

```json
{
  "version": "1.0.0",
  "project": {
    "name": "my-project"
  },
  "subagents": {
    "test-runner": "playwright",
    "team-communicator": "slack",
    "documentation-researcher": "notion",
    "issue-tracker": "linear"
  }
}
```

**Don't edit `config.json` manually** - use `bugzy setup` to reconfigure.

## Environment Variables

Bugzy loads environment variables for MCP servers and test configuration:

```bash
# MCP Secrets
SLACK_BOT_TOKEN=xoxb-...
NOTION_TOKEN=secret_...
LINEAR_API_KEY=lin_api_...

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
- **Claude Code** installed and configured
- **npm** or **yarn** package manager

## Reconfiguration

Need to change your setup? Just run:

```bash
bugzy setup
```

Bugzy will detect your existing configuration and allow you to make changes.

## Troubleshooting

### Command Not Found

```bash
npm install -g bugzy
```

### Missing Secrets

```
✗ Missing required MCP secrets: SLACK_BOT_TOKEN
```

Add the missing secret to your `.env` file.

### Claude Code Not Found

Install Claude Code and ensure it's in your PATH.

See the [Getting Started Guide](./docs/getting-started.md) for more troubleshooting tips.

## FAQ

**Q: Do I need a package.json?**
A: No! Bugzy works with any project type.

**Q: Can I use this with Python/Ruby/Go projects?**
A: Yes! Bugzy is language-agnostic.

**Q: Where are my secrets stored?**
A: In `.env` which is gitignored. Only `.env.example` is committed.

**Q: Can I customize the tasks?**
A: You can customize templates in `.bugzy/runtime/templates/`.

**Q: How do I update to get new tasks?**
A: Run `npm update -g bugzy && bugzy setup`

## License

MIT © Bugzy Team

## Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon).

## Support

- **Issues**: [github.com/bugzy-ai/bugzy-oss/issues](https://github.com/bugzy-ai/bugzy-oss/issues)
- **Discussions**: [github.com/bugzy-ai/bugzy-oss/discussions](https://github.com/bugzy-ai/bugzy-oss/discussions)
- **Documentation**: [docs.bugzy.dev](https://docs.bugzy.dev)
