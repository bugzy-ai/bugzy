/**
 * Task Builder Module
 * Builds dynamic task definitions based on project's configured subagents
 */

import {
  TASK_TEMPLATES,
  type ComposedTaskTemplate,
  type TaskFrontmatter,
} from '../tasks';
import { getStep, normalizeStepReference, isInlineStep } from '../tasks/steps';
import { getIntegration } from '../subagents/metadata';

/**
 * Dynamic Task Definition
 * Built at runtime based on project's subagent configuration
 */
export interface TaskDefinition {
  slug: string;
  name: string;
  description: string;
  frontmatter: TaskFrontmatter; // Frontmatter from task template
  content: string; // Dynamically built with optional subagent blocks
  requiredSubAgentRoles: string[];
  requiredMCPs: string[];
}

/**
 * Project Subagent Configuration
 */
export interface ProjectSubAgent {
  role: string; // e.g., 'documentation-researcher'
  integration: string; // e.g., 'notion', 'confluence'
}

/**
 * Build dynamic task definition based on project's configured subagents
 *
 * @param taskSlug - Task slug to build
 * @param projectSubAgents - Project's configured subagents
 * @returns Dynamic task definition with content adapted to available subagents
 * @throws Error if task slug is unknown or required subagents are missing
 */
export function buildTaskDefinition(
  taskSlug: string,
  projectSubAgents: ProjectSubAgent[]
): TaskDefinition {
  const template = TASK_TEMPLATES[taskSlug];

  if (!template) {
    throw new Error(`Unknown task slug: ${taskSlug}`);
  }

  return buildComposedTaskDefinition(taskSlug, projectSubAgents);
}

/**
 * Get all available tasks for a project (filters by required subagents)
 * Only returns tasks where all required subagents are configured
 *
 * @param projectSubAgents - Project's configured subagents
 * @returns Array of task templates that can be executed
 */
export function getAvailableTasks(
  projectSubAgents: ProjectSubAgent[]
): ComposedTaskTemplate[] {
  return Object.values(TASK_TEMPLATES).filter(template =>
    template.requiredSubagents.every(requiredRole =>
      projectSubAgents.some(sa => sa.role === requiredRole)
    )
  );
}

/**
 * Check if a task is available for a project
 *
 * @param taskSlug - Task slug to check
 * @param projectSubAgents - Project's configured subagents
 * @returns True if all required subagents are configured
 */
export function isTaskAvailable(
  taskSlug: string,
  projectSubAgents: ProjectSubAgent[]
): boolean {
  const template = TASK_TEMPLATES[taskSlug];

  if (!template) {
    return false;
  }

  return template.requiredSubagents.every(requiredRole =>
    projectSubAgents.some(sa => sa.role === requiredRole)
  );
}

/**
 * Get missing subagents required for a task
 *
 * @param taskSlug - Task slug to check
 * @param projectSubAgents - Project's configured subagents
 * @returns Array of missing required subagent roles, empty if all are configured
 */
export function getMissingSubagents(
  taskSlug: string,
  projectSubAgents: ProjectSubAgent[]
): string[] {
  const template = TASK_TEMPLATES[taskSlug];

  if (!template) {
    return [];
  }

  return template.requiredSubagents.filter(requiredRole =>
    !projectSubAgents.some(sa => sa.role === requiredRole)
  );
}

/**
 * Build task definition with all dependent tasks
 * Returns array: [primaryTask, ...dependentTasks]
 *
 * @param taskSlug - Primary task slug to build
 * @param projectSubAgents - Project's configured subagents
 * @returns Array of task definitions (primary first, then dependents)
 */
export function buildTaskWithDependencies(
  taskSlug: string,
  projectSubAgents: ProjectSubAgent[]
): TaskDefinition[] {
  const template = TASK_TEMPLATES[taskSlug];

  if (!template) {
    throw new Error(`Unknown task slug: ${taskSlug}`);
  }

  // Build primary task
  const primaryTask = buildTaskDefinition(taskSlug, projectSubAgents);
  const allTasks: TaskDefinition[] = [primaryTask];

  // Build dependent tasks (skip if missing required subagents)
  for (const depSlug of template.dependentTasks || []) {
    try {
      const depTask = buildTaskDefinition(depSlug, projectSubAgents);
      allTasks.push(depTask);
    } catch (e) {
      // Dependent task can't be built (missing subagents) - skip it
      console.warn(`Skipping dependent task ${depSlug}: ${(e as Error).message}`);
    }
  }

  return allTasks;
}

/**
 * Build task definition from ComposedTaskTemplate
 * Assembles steps into final content with auto-numbering
 *
 * @param taskSlug - Task slug to build
 * @param projectSubAgents - Project's configured subagents
 * @returns Dynamic task definition with assembled step content
 * @throws Error if required subagents are missing
 */
export function buildComposedTaskDefinition(
  taskSlug: string,
  projectSubAgents: ProjectSubAgent[]
): TaskDefinition {
  const template = TASK_TEMPLATES[taskSlug];

  if (!template) {
    throw new Error(`Unknown task slug: ${taskSlug}`);
  }

  // Validate required subagents are configured
  for (const requiredRole of template.requiredSubagents) {
    const configured = projectSubAgents.find((sa) => sa.role === requiredRole);
    if (!configured) {
      throw new Error(`Task "${taskSlug}" requires subagent "${requiredRole}" to be configured`);
    }
  }

  // Determine which optional subagents are configured
  const configuredRoles = new Set(projectSubAgents.map((sa) => sa.role));

  // Build content by assembling steps
  const contentParts: string[] = [];
  let stepNumber = 1;

  // Assemble steps (both inline and library references)
  for (const stepRef of template.steps) {
    // Handle inline steps
    if (isInlineStep(stepRef)) {
      // Check conditional
      if (stepRef.conditionalOnSubagent && !configuredRoles.has(stepRef.conditionalOnSubagent)) {
        continue; // Skip step - required subagent not configured
      }

      const header = `### Step ${stepNumber}: ${stepRef.title}\n\n`;
      contentParts.push(header + stepRef.content);
      stepNumber++;
      continue;
    }

    // Handle library step references
    const normalized = normalizeStepReference(stepRef);
    if (!normalized) {
      continue; // Should not happen, but guard against it
    }

    // Check if step should be included
    if (normalized.conditionalOnSubagent && !configuredRoles.has(normalized.conditionalOnSubagent)) {
      continue; // Skip step - required subagent not configured
    }

    // Get step from registry
    let step;
    try {
      step = getStep(normalized.stepId);
    } catch {
      console.warn(`Step "${normalized.stepId}" not found, skipping`);
      continue;
    }

    // Check step's own requiresSubagent
    if (step.requiresSubagent && !configuredRoles.has(step.requiresSubagent)) {
      continue; // Skip step - required subagent not configured
    }

    // Build step content
    const title = normalized.title || step.title;
    const header = `### Step ${stepNumber}: ${title}\n\n`;
    let content = step.content.replace(/\{\{STEP_NUMBER\}\}/g, String(stepNumber));

    // Append additional content if specified
    if (normalized.appendContent) {
      content += '\n\n' + normalized.appendContent;
    }

    contentParts.push(header + content);
    stepNumber++;
  }

  // Collect all required subagent roles
  const requiredSubAgentRoles = new Set<string>(template.requiredSubagents);

  // Add optional subagents that are configured
  for (const optional of template.optionalSubagents || []) {
    if (configuredRoles.has(optional)) {
      requiredSubAgentRoles.add(optional);
    }
  }

  // Derive required MCPs from subagent integrations
  const requiredMCPs = new Set<string>();
  for (const role of requiredSubAgentRoles) {
    const configured = projectSubAgents.find((sa) => sa.role === role);
    if (configured) {
      const integrationMeta = getIntegration(configured.integration);
      const mcpProvider = integrationMeta?.provider || configured.integration;
      requiredMCPs.add(mcpProvider);
    }
  }

  // Build final content
  const content = contentParts.join('\n\n');

  return {
    slug: template.slug,
    name: template.name,
    description: template.description,
    frontmatter: template.frontmatter,
    content,
    requiredSubAgentRoles: Array.from(requiredSubAgentRoles),
    requiredMCPs: Array.from(requiredMCPs),
  };
}
