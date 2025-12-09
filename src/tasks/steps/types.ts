/**
 * Step Module Types
 * Type definitions for atomic, composable task steps
 */

import type { TaskFrontmatter } from '../types';

/**
 * Step category for organization and filtering
 */
export type StepCategory =
  | 'security' // Security notices and warnings
  | 'setup' // Loading context, reading artifacts
  | 'exploration' // Exploring the application
  | 'clarification' // Handling ambiguity and questions
  | 'execution' // Running tests, parsing results
  | 'generation' // Creating test plans, cases, code
  | 'communication' // Team notifications
  | 'maintenance'; // Knowledge base updates, cleanup

/**
 * TaskStep - Atomic, reusable unit of work within a task
 *
 * Steps are the building blocks of composed tasks. Each step represents
 * a discrete piece of work with clear instructions.
 */
export interface TaskStep {
  /**
   * Unique identifier for the step (kebab-case)
   * Examples: 'read-knowledge-base', 'triage-failures', 'run-playwright-tests'
   */
  id: string;

  /**
   * Human-readable step title (used in generated markdown headers)
   * Examples: 'Read Knowledge Base', 'Triage Failed Tests'
   */
  title: string;

  /**
   * Step category for organization
   */
  category: StepCategory;

  /**
   * Step content - the actual instructions as markdown string.
   *
   * Supported placeholders:
   * - {{STEP_NUMBER}} - Auto-replaced with computed step number during assembly
   * - {{INVOKE_*}} - Subagent invocation placeholders (e.g., {{INVOKE_TEST_DEBUGGER_FIXER}})
   * - $ARGUMENTS - Task arguments from user input
   */
  content: string;

  /**
   * Optional subagent role this step requires to be included.
   * If specified, step is only included when this subagent is configured.
   *
   * Use for steps that make no sense without the subagent.
   * Example: 'log-product-bugs' step requires 'issue-tracker' subagent
   */
  requiresSubagent?: string;

  /**
   * Subagent roles that this step invokes (for MCP derivation).
   * Different from requiresSubagent - this lists subagents the step calls
   * via {{INVOKE_*}} placeholders, not what makes the step available.
   */
  invokesSubagents?: string[];

  /**
   * Tags for categorization, filtering, and step discovery.
   * Examples: ['setup', 'execution', 'optional', 'triage']
   */
  tags?: string[];
}

/**
 * StepReferenceObject - Reference to a step in STEP_LIBRARY with per-usage configuration
 */
export interface StepReferenceObject {
  /**
   * The step ID to include from STEP_LIBRARY
   */
  stepId: string;

  /**
   * Override the step title for this specific usage
   */
  title?: string;

  /**
   * Additional content to append after the step
   */
  appendContent?: string;

  /**
   * Make this step conditional on a subagent being configured.
   * Different from step's requiresSubagent - this is per-task configuration.
   */
  conditionalOnSubagent?: string;
}

/**
 * InlineStep - Step with body defined directly in the task definition
 * Use for task-specific content like headers, arguments, or unique steps
 */
export interface InlineStep {
  /**
   * Discriminator to identify inline steps
   */
  inline: true;

  /**
   * Step title (becomes ### Step N: {title})
   */
  title: string;

  /**
   * Step body content (markdown)
   */
  content: string;

  /**
   * Optional category for metadata/filtering
   */
  category?: StepCategory;

  /**
   * Make this step conditional on a subagent being configured
   */
  conditionalOnSubagent?: string;
}

/**
 * StepReference - How tasks reference steps in their composition
 *
 * Can be:
 * - Simple string (step ID from STEP_LIBRARY)
 * - StepReferenceObject (reference with overrides)
 * - InlineStep (step with body defined inline)
 */
export type StepReference = string | StepReferenceObject | InlineStep;


/**
 * ComposedTaskTemplate - Task built from step composition
 *
 * This is the new task format that replaces monolithic baseContent strings
 * with an array of step references.
 */
export interface ComposedTaskTemplate {
  /**
   * Unique task identifier (kebab-case)
   */
  slug: string;

  /**
   * Human-readable task name
   */
  name: string;

  /**
   * Brief task description
   */
  description: string;

  /**
   * Frontmatter for slash command generation
   */
  frontmatter: TaskFrontmatter;

  /**
   * Ordered list of step references that compose this task.
   * Steps are assembled in order with auto-generated step numbers.
   */
  steps: StepReference[];

  /**
   * Required subagents - task fails to build without these.
   * Instructions for required subagents should be embedded in step content.
   */
  requiredSubagents: string[];

  /**
   * Optional subagents - enhance task when configured.
   * Steps using these are conditionally included.
   */
  optionalSubagents?: string[];

  /**
   * Task slugs that can be invoked during execution.
   */
  dependentTasks?: string[];
}

/**
 * Normalized step reference (internal use for library steps)
 */
export interface NormalizedStepReference {
  stepId: string;
  title?: string;
  appendContent?: string;
  conditionalOnSubagent?: string;
}

/**
 * Type guard to check if a StepReference is an InlineStep
 */
export function isInlineStep(ref: StepReference): ref is InlineStep {
  return typeof ref === 'object' && 'inline' in ref && ref.inline === true;
}

/**
 * Type guard to check if a StepReference is a StepReferenceObject
 */
export function isStepReferenceObject(ref: StepReference): ref is StepReferenceObject {
  return typeof ref === 'object' && 'stepId' in ref;
}

/**
 * Normalize a step reference to its full object form (for library steps only)
 * Returns null for inline steps - use isInlineStep to check first
 */
export function normalizeStepReference(ref: StepReference): NormalizedStepReference | null {
  if (isInlineStep(ref)) {
    return null; // Inline steps don't normalize to NormalizedStepReference
  }
  if (typeof ref === 'string') {
    return { stepId: ref };
  }
  return ref as StepReferenceObject;
}
