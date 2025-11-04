/**
 * Type definitions for subagent templates
 */

/**
 * Frontmatter metadata for subagent templates
 */
export interface SubagentFrontmatter {
  /** Subagent role identifier (e.g., 'test-runner', 'team-communicator') */
  name: string;
  /** Description of when and how to use this subagent */
  description: string;
  /** Claude model to use (sonnet for complex tasks, haiku for simple ones) */
  model: 'sonnet' | 'haiku';
  /** UI color representation */
  color: string;
  /** Optional array of available tools for this subagent */
  tools?: string[];
}

/**
 * Complete subagent template with typed frontmatter and content
 */
export interface SubagentTemplate {
  frontmatter: SubagentFrontmatter;
  content: string;
}

/**
 * Subagent configuration for Cloud Run (same structure as template)
 */
export interface SubagentConfig {
  frontmatter: SubagentFrontmatter;
  content: string;
}
