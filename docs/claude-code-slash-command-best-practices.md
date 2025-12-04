# Claude Code Slash Command Best Practices

> Compiled from official Anthropic documentation and community best practices (2025)

> **Note**: This documentation is specific to **Claude Code**. Bugzy also has experimental support for Cursor and Codex CLI, which have different command systems. See [Configuration Guide](./configuration.md) for multi-tool support information.

## Overview

Slash commands are custom prompt templates stored as Markdown files that enable quick access to predefined workflows in Claude Code. They provide a structured way to standardize team workflows and automate repetitive tasks.

## Storage Locations

### Project-Level Commands
- **Location**: `.claude/commands/` in project root
- **Scope**: Shared with team via git
- **Label**: Shows `(project)` in `/help` output
- **Use case**: Team workflows, project-specific automation

### User-Level Commands
- **Location**: `~/.claude/commands/` in home directory
- **Scope**: Available across all projects for the user
- **Label**: Shows `(user)` in `/help` output
- **Use case**: Personal workflows, cross-project utilities

### MCP-Based Commands
- **Source**: Dynamically exposed from MCP servers
- **Scope**: Available when MCP server is connected
- **Use case**: Integration with external services and tools

## Command Structure

### File Naming
- Use descriptive, concise filenames (without `.md` extension)
- Filename becomes the command name
- Use verb-noun format: `generate-tests.md`, `review-code.md`
- Support for namespacing via subdirectories

### Frontmatter Configuration

Commands support YAML frontmatter for metadata:

```yaml
---
subcommand_name: command-name           # Optional: override filename
description: Brief command description   # REQUIRED for SlashCommand tool
allowed-tools: 'Read, Write, Bash(*)'   # Tool permissions
argument-hint: '[param1] [param2]'      # Help text for arguments
model: sonnet                           # Optional: specify model
disable-model-invocation: false         # Prevent auto-execution
---
```

#### Frontmatter Best Practices

**`description`** (REQUIRED)
- Brief, clear description of what the command does
- Appears in `/help` output
- Required for Claude to discover command via SlashCommand tool
- Example: `"Generate test cases from test plan"`

**`allowed-tools`**
- Specify only necessary tools for security
- Use specific permissions: `Bash(git status:*)` not `Bash(*)`
- Restricts what the command can execute
- Example: `'Read, Write, MultiEdit, Task'`

**`argument-hint`**
- Documents expected parameters
- Helps with autocompletion
- Improves discoverability
- Example: `'--type [functional|smoke] --focus [feature]'`

**`subcommand_name`**
- Override filename as command name
- Useful for legacy compatibility
- Generally prefer consistent filename approach

**`model`**
- Specify Claude model if command needs specific capabilities
- Options: `sonnet`, `opus`, `haiku`
- Use haiku for quick, simple tasks to reduce cost

## Argument Handling

### Dynamic Parameters with $ARGUMENTS

Capture all arguments as a single string:

```markdown
Please analyze and fix GitHub issue: $ARGUMENTS

Follow these steps:
1. Use `gh issue view $ARGUMENTS` to fetch details
2. Analyze the requirements
3. Implement the fix
```

Usage: `/issue 123` replaces `$ARGUMENTS` with "123"

### Positional Arguments

For structured commands requiring multiple parameters:

```markdown
---
argument-hint: '[pr-number] [priority] [assignee]'
---

Review PR $1 with priority: $2
Assign to: $3

Default priority: ${2:-medium}
```

Usage: `/review 456 high @john`

**Best Practice**: Use positional arguments when you need to:
- Access arguments individually in different parts of command
- Provide default values
- Validate specific parameters
- Create structured multi-parameter workflows

## Organization Patterns

### Subdirectories for Namespacing

Organize related commands without affecting command names:

```
.claude/commands/
├── testing/
│   ├── generate-plan.md      → /generate-plan
│   ├── generate-cases.md     → /generate-cases
│   └── run-tests.md          → /run-tests
├── review/
│   ├── code-review.md        → /code-review
│   └── security-audit.md     → /security-audit
```

**Note**: Subdirectories create logical grouping but don't prefix command names

### Hierarchical Command Naming

Use colon-separated names for explicit namespacing:

```
.claude/commands/
├── project-new.md            → /project-new
├── project-build.md          → /project-build
└── posts-publish.md          → /posts-publish
```

## Advanced Features

### Bash Integration

Execute commands with `!` prefix to include output in context:

```markdown
---
allowed-tools: 'Bash(git *)'
---

Analyze the current git status:
!git status
!git log --oneline -5
```

**Security**: Always declare specific `allowed-tools` permissions

### File References

Include file contents with `@` prefix:

```markdown
Review this implementation:
@src/utils/helpers.js

Compare against the spec:
@docs/api-spec.md
```

### Extended Thinking Mode

Trigger deeper analysis by including extended thinking keywords:

```markdown
Carefully analyze the architecture and think deeply about:
- Performance implications
- Security considerations
- Scalability concerns
```

## Command Design Best Practices

### 1. Clear Purpose & Scope
- Single, well-defined responsibility
- Avoid overly broad commands
- Make purpose obvious from name

### 2. Structured Instructions
- Use numbered steps for multi-step workflows
- Separate concerns into distinct sections
- Include clear success criteria

### 3. Context Provision
- Document expected starting state
- List prerequisites
- Reference relevant files or documentation

### 4. Tool Specification
- Only request necessary tools
- Use specific permissions over wildcards
- Document why each tool is needed

### 5. Argument Documentation
- Provide clear `argument-hint`
- Document expected format
- Show examples in command description

### 6. Consistent Formatting
- Use Markdown headings for structure
- Code blocks for examples
- Lists for steps and options

### 7. Error Handling
- Include validation steps
- Specify what to do on failure
- Provide clear error messages

## SlashCommand Tool Integration

For Claude to proactively invoke commands during conversation:

1. **Include `description` frontmatter** - Required for discovery
2. **Reference in CLAUDE.md** - Mention by name with slash
3. **Use descriptive names** - Make intent clear

Example CLAUDE.md reference:
```markdown
When generating tests, use /generate-test-cases with appropriate type.
Before committing, always run /code-review to check quality.
```

## Template Structure Patterns

### Simple Command Template
```markdown
---
description: Quick description
allowed-tools: 'Read, Write'
---

# Command Name

## Context
[Explain when to use this]

## Process
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Output
[What to produce]
```

### Complex Workflow Template
```markdown
---
description: Multi-step workflow
allowed-tools: 'Read, Write, Bash(npm *), Task'
argument-hint: '[feature-name] [priority]'
---

# Complex Workflow Command

## Arguments
- Feature: $1
- Priority: ${2:-medium}

## Step 1: Preparation
[Detailed instructions]

## Step 2: Implementation
[Detailed instructions]

## Step 3: Validation
[Detailed instructions]

## Step 4: Documentation
[Detailed instructions]

## Final Summary
[What to report]
```

### Agent Orchestration Template
```markdown
---
description: Coordinate multiple subagents
allowed-tools: 'Read, Write, Task'
---

# Agent Orchestration

## Step 1: Use Subagent A
\`\`\`
Use the researcher-agent to:
- Gather documentation
- Identify requirements
\`\`\`

## Step 2: Use Subagent B
\`\`\`
Use the code-generator-agent to:
- Generate implementation
- Create tests
\`\`\`

## Step 3: Validation
[Validation steps]
```

## Optimization Tips

### Performance
- Use `haiku` model for simple, quick tasks
- Minimize context by reading only necessary files
- Cache commonly accessed data in command structure

### Maintainability
- Version control all project commands
- Document command dependencies
- Keep commands focused and modular
- Regular review and refactoring

### Team Collaboration
- Standardize naming conventions
- Create command catalog documentation
- Include examples in descriptions
- Review commands in PRs

### Security
- Minimal tool permissions
- Validate external inputs
- Avoid hardcoded secrets
- Document security considerations

## Common Use Cases

### Code Review Workflow
```markdown
---
description: Comprehensive code review
allowed-tools: 'Read, Bash(git *)'
argument-hint: '[file-pattern]'
---

Review files matching: $ARGUMENTS

1. Check code style and conventions
2. Identify potential bugs
3. Suggest improvements
4. Verify test coverage
```

### Test Generation
```markdown
---
description: Generate test cases from specification
allowed-tools: 'Read, Write, Task'
argument-hint: '[spec-file] [test-type]'
---

Generate $2 tests from: $1

1. Read specification
2. Identify test scenarios
3. Generate test cases
4. Create test files
```

### Issue Analysis
```markdown
---
description: Analyze and fix GitHub issue
allowed-tools: 'Read, Write, Bash(gh *)'
argument-hint: '[issue-number]'
---

Fix issue #$ARGUMENTS

1. Fetch issue details: !gh issue view $ARGUMENTS
2. Analyze requirements
3. Implement fix
4. Update tests
5. Document changes
```

## Anti-Patterns to Avoid

### ❌ Overly Generic Commands
```markdown
# Bad: Too broad
Do whatever is needed for: $ARGUMENTS
```

### ❌ Hardcoded Values
```markdown
# Bad: Not reusable
Review PR #123 assigned to John
```

### ❌ Missing Tool Permissions
```markdown
# Bad: Will fail when trying to use tools
Run tests and commit results
# (no allowed-tools specified)
```

### ❌ Unclear Arguments
```markdown
# Bad: Ambiguous parameters
Process $1 with $2 using $3
# (no argument-hint, no context)
```

### ❌ No Structure
```markdown
# Bad: Unstructured wall of text
Just analyze the code and fix any issues you find and make sure everything works...
```

## Best Practices Checklist

Before creating a slash command:

- [ ] Clear, single-purpose functionality
- [ ] Descriptive filename (verb-noun format)
- [ ] Frontmatter with `description` field
- [ ] `allowed-tools` specifies only necessary permissions
- [ ] `argument-hint` documents expected parameters
- [ ] Structured with clear sections and steps
- [ ] Examples or usage documentation included
- [ ] Error handling and validation steps
- [ ] Security considerations addressed
- [ ] Tested with various inputs
- [ ] Documented in team command catalog

## Resources

- [Official Claude Code Slash Commands Documentation](https://code.claude.com/docs/en/slash-commands)
- [Claude Code Best Practices (Anthropic Engineering)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Awesome Claude Code (Community)](https://github.com/hesreallyhim/awesome-claude-code)
- [Claude Code Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/)

---

*Last Updated: 2025 - Based on Claude Code latest documentation and community best practices*
