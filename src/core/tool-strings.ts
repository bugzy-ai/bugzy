/**
 * Tool-Specific Strings
 *
 * Provides tool-specific strings for subagent invocation and other tool-dependent text.
 * Each AI coding tool has different patterns for invoking subagents/specialized agents.
 *
 * Claude Code: Uses Task tool with subagent_type parameter
 * Cursor: Uses cursor-agent CLI with -p flag to provide prompt
 * Codex: Uses codex CLI with -p flag to provide prompt
 */

import { ToolId } from './tool-profile';

/**
 * Subagent roles that can be invoked from tasks
 */
export type SubagentRole =
  | 'browser-automation'
  | 'test-debugger-fixer'
  | 'test-code-generator'
  | 'team-communicator'
  | 'issue-tracker'
  | 'documentation-researcher'
  | 'changelog-historian';

/**
 * Intent-based keys for tool-specific strings
 * These represent what action needs to happen, not how
 */
export type ToolStringKey =
  | 'INVOKE_BROWSER_AUTOMATION'
  | 'INVOKE_TEST_DEBUGGER_FIXER'
  | 'INVOKE_TEST_CODE_GENERATOR'
  | 'INVOKE_TEAM_COMMUNICATOR'
  | 'INLINE_TEAM_COMMUNICATOR'
  | 'INVOKE_ISSUE_TRACKER'
  | 'INVOKE_DOCUMENTATION_RESEARCHER'
  | 'INVOKE_CHANGELOG_HISTORIAN';

/**
 * Map subagent role to tool string key
 */
const ROLE_TO_KEY: Record<SubagentRole, ToolStringKey> = {
  'browser-automation': 'INVOKE_BROWSER_AUTOMATION',
  'test-debugger-fixer': 'INVOKE_TEST_DEBUGGER_FIXER',
  'test-code-generator': 'INVOKE_TEST_CODE_GENERATOR',
  'team-communicator': 'INVOKE_TEAM_COMMUNICATOR',
  'issue-tracker': 'INVOKE_ISSUE_TRACKER',
  'documentation-researcher': 'INVOKE_DOCUMENTATION_RESEARCHER',
  'changelog-historian': 'INVOKE_CHANGELOG_HISTORIAN',
};

/**
 * Tool-specific strings for each AI coding tool
 *
 * Claude Code: Natural language instructions - the Task tool handles subagent invocation
 * Cursor: CLI command to spawn cursor-agent with the agent's prompt file
 * Codex: CLI command to spawn codex with the agent's prompt file
 */
export const TOOL_STRINGS: Record<ToolId, Record<ToolStringKey, string>> = {
  'claude-code': {
    INVOKE_BROWSER_AUTOMATION:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "browser-automation"` to delegate test execution.\n' +
      'The browser-automation agent will handle all browser automation. DO NOT execute Playwright MCP tools directly.\n' +
      'Include the test case path and any specific instructions in the prompt.',
    INVOKE_TEST_DEBUGGER_FIXER:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "test-debugger-fixer"` to delegate debugging.\n' +
      'The agent will analyze failures and fix test code. Include error details and test path in the prompt.',
    INVOKE_TEST_CODE_GENERATOR:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "test-code-generator"` to delegate code generation.\n' +
      'The agent will create automated tests and page objects. Include test case files in the prompt.',
    INVOKE_TEAM_COMMUNICATOR:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "team-communicator"` to send team notifications.\n' +
      'The agent will post to Slack/Teams/Email. Include message content and context in the prompt.',
    INLINE_TEAM_COMMUNICATOR:
      '**TEAM COMMUNICATION**: Read `.claude/agents/team-communicator.md` and follow its instructions to communicate with the team.\n' +
      'Use the tools and guidelines specified in that file within this context. Do NOT spawn a sub-agent.',
    INVOKE_ISSUE_TRACKER:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "issue-tracker"` to create/update issues.\n' +
      'The agent will interact with Jira. Include bug details and classification in the prompt.',
    INVOKE_DOCUMENTATION_RESEARCHER:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "documentation-researcher"` to search docs.\n' +
      'The agent will search Notion/Confluence. Include search query and context in the prompt.',
    INVOKE_CHANGELOG_HISTORIAN:
      '**DELEGATE TO SUBAGENT**: Use the Task tool with `subagent_type: "changelog-historian"` to retrieve change history.\n' +
      'The agent will query GitHub for PRs and commits. Include repo context and date range in the prompt.',
  },

  'cursor': {
    INVOKE_BROWSER_AUTOMATION:
      'Run the browser-automation agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/browser-automation.md)" --output-format text\n```',
    INVOKE_TEST_DEBUGGER_FIXER:
      'Run the test-debugger-fixer agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/test-debugger-fixer.md)" --output-format text\n```',
    INVOKE_TEST_CODE_GENERATOR:
      'Run the test-code-generator agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/test-code-generator.md)" --output-format text\n```',
    INVOKE_TEAM_COMMUNICATOR:
      'Run the team-communicator agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/team-communicator.md)" --output-format text\n```',
    INLINE_TEAM_COMMUNICATOR:
      '**TEAM COMMUNICATION**: Read `.cursor/agents/team-communicator.md` and follow its instructions to communicate with the team.\n' +
      'Use the tools and guidelines specified in that file within this context.',
    INVOKE_ISSUE_TRACKER:
      'Run the issue-tracker agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/issue-tracker.md)" --output-format text\n```',
    INVOKE_DOCUMENTATION_RESEARCHER:
      'Run the documentation-researcher agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/documentation-researcher.md)" --output-format text\n```',
    INVOKE_CHANGELOG_HISTORIAN:
      'Run the changelog-historian agent:\n```bash\ncursor-agent -p "$(cat .cursor/agents/changelog-historian.md)" --output-format text\n```',
  },

  'codex': {
    INVOKE_BROWSER_AUTOMATION:
      'Run the browser-automation agent:\n```bash\ncodex -p "$(cat .codex/agents/browser-automation.md)"\n```',
    INVOKE_TEST_DEBUGGER_FIXER:
      'Run the test-debugger-fixer agent:\n```bash\ncodex -p "$(cat .codex/agents/test-debugger-fixer.md)"\n```',
    INVOKE_TEST_CODE_GENERATOR:
      'Run the test-code-generator agent:\n```bash\ncodex -p "$(cat .codex/agents/test-code-generator.md)"\n```',
    INVOKE_TEAM_COMMUNICATOR:
      'Run the team-communicator agent:\n```bash\ncodex -p "$(cat .codex/agents/team-communicator.md)"\n```',
    INLINE_TEAM_COMMUNICATOR:
      '**TEAM COMMUNICATION**: Read `.codex/agents/team-communicator.md` and follow its instructions to communicate with the team.\n' +
      'Use the tools and guidelines specified in that file within this context.',
    INVOKE_ISSUE_TRACKER:
      'Run the issue-tracker agent:\n```bash\ncodex -p "$(cat .codex/agents/issue-tracker.md)"\n```',
    INVOKE_DOCUMENTATION_RESEARCHER:
      'Run the documentation-researcher agent:\n```bash\ncodex -p "$(cat .codex/agents/documentation-researcher.md)"\n```',
    INVOKE_CHANGELOG_HISTORIAN:
      'Run the changelog-historian agent:\n```bash\ncodex -p "$(cat .codex/agents/changelog-historian.md)"\n```',
  },
};

/**
 * Get a tool-specific string by key
 * @param toolId - Tool identifier
 * @param key - String key
 * @returns Tool-specific string
 */
export function getToolString(toolId: ToolId, key: ToolStringKey): string {
  const toolStrings = TOOL_STRINGS[toolId];
  if (!toolStrings) {
    throw new Error(`Unknown tool: ${toolId}`);
  }
  const value = toolStrings[key];
  if (!value) {
    throw new Error(`Unknown string key: ${key} for tool: ${toolId}`);
  }
  return value;
}

/**
 * Get subagent invocation string for a specific role
 * @param toolId - Tool identifier
 * @param role - Subagent role
 * @returns Invocation string for the tool
 */
export function getSubagentInvocation(toolId: ToolId, role: SubagentRole): string {
  const key = ROLE_TO_KEY[role];
  if (!key) {
    throw new Error(`Unknown subagent role: ${role}`);
  }
  return getToolString(toolId, key);
}

/**
 * Replace invocation placeholders in content with tool-specific strings
 *
 * This function finds {{INVOKE_*}} placeholders in content and replaces them
 * with the corresponding tool-specific invocation strings.
 *
 * @param content - Content with {{INVOKE_*}} placeholders
 * @param toolId - Target tool
 * @param isLocal - If true, use inline instructions for team-communicator (default: false)
 * @returns Content with tool-specific invocations
 */
export function replaceInvocationPlaceholders(
  content: string,
  toolId: ToolId,
  isLocal: boolean = false
): string {
  let result = content;

  // Replace each invocation placeholder
  const keys: ToolStringKey[] = [
    'INVOKE_BROWSER_AUTOMATION',
    'INVOKE_TEST_DEBUGGER_FIXER',
    'INVOKE_TEST_CODE_GENERATOR',
    'INVOKE_TEAM_COMMUNICATOR',
    'INVOKE_ISSUE_TRACKER',
    'INVOKE_DOCUMENTATION_RESEARCHER',
    'INVOKE_CHANGELOG_HISTORIAN',
  ];

  for (const key of keys) {
    const placeholder = `{{${key}}}`;

    // For team-communicator in local mode, use INLINE version
    const replacementKey =
      isLocal && key === 'INVOKE_TEAM_COMMUNICATOR' ? 'INLINE_TEAM_COMMUNICATOR' : key;

    const replacement = getToolString(toolId, replacementKey);
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }

  return result;
}
