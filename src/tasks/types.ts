/**
 * Task Module Types
 * Type definitions for task templates
 */

/**
 * Task Frontmatter
 * Metadata from the .claude/commands/*.md files
 */
export interface TaskFrontmatter {
  name?: string;
  description: string;
  'allowed-tools'?: string;
  'argument-hint'?: string;
}

/**
 * Optional Subagent Block
 * Conditionally included in task content if subagent is configured
 *
 * The contentBlock will be injected into baseContent at placeholder positions.
 * Placeholder format: {{ROLE_NAME_INSTRUCTIONS}} where ROLE_NAME is the role
 * in uppercase with hyphens replaced by underscores.
 *
 * Example:
 * - role: 'documentation-researcher'
 * - placeholder: {{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}
 * - If configured: placeholder replaced with contentBlock
 * - If not configured: placeholder replaced with empty string
 */
export interface OptionalSubagentBlock {
  role: string; // e.g., 'documentation-researcher'
  contentBlock: string; // Markdown content with {{integration}} and {{subagent_role}} placeholders
}

/**
 * Complete Task Template Definition
 * Defines everything needed to execute a task
 */
export interface TaskTemplate {
  slug: string;
  name: string;
  description: string;

  // Frontmatter from .claude/commands/*.md
  frontmatter: TaskFrontmatter;

  // Content
  baseContent: string; // Core instructions (always included)
  optionalSubagents: OptionalSubagentBlock[]; // Added if configured
  requiredSubagents: string[]; // Must be configured for task to work

  // Task Dependencies
  dependentTasks?: string[]; // Task slugs that can be invoked during execution
}
