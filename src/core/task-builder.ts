/**
 * Task Builder Module
 * Builds dynamic task definitions based on project's configured subagents
 */

import { TASK_TEMPLATES, type TaskTemplate, type TaskFrontmatter } from '../tasks';

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

  // Validate required subagents are configured
  for (const requiredRole of template.requiredSubagents) {
    const configured = projectSubAgents.find(sa => sa.role === requiredRole);
    if (!configured) {
      throw new Error(
        `Task "${taskSlug}" requires subagent "${requiredRole}" to be configured`
      );
    }
  }

  // Start with base content
  let content = template.baseContent;
  const requiredSubAgentRoles = new Set<string>(template.requiredSubagents);

  // Replace optional subagent placeholders in baseContent
  for (const optional of template.optionalSubagents) {
    const configured = projectSubAgents.find(sa => sa.role === optional.role);

    // Generate placeholder name: {{ROLE_NAME_INSTRUCTIONS}}
    const placeholderName = optional.role.toUpperCase().replace(/-/g, '_') + '_INSTRUCTIONS';
    const placeholder = `{{${placeholderName}}}`;

    if (configured) {
      // Replace placeholder with actual instructions (no further processing needed)
      content = content.replace(new RegExp(placeholder, 'g'), optional.contentBlock);
      requiredSubAgentRoles.add(optional.role);
    } else {
      // Replace placeholder with empty string
      content = content.replace(new RegExp(placeholder, 'g'), '');
    }
  }

  // Derive required MCPs from subagent integrations
  const requiredMCPs = new Set<string>();
  for (const role of requiredSubAgentRoles) {
    const configured = projectSubAgents.find(sa => sa.role === role);
    if (configured) {
      // Map integration to MCP provider (usually same name)
      requiredMCPs.add(configured.integration);
    }
  }

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

/**
 * Get all available tasks for a project (filters by required subagents)
 * Only returns tasks where all required subagents are configured
 *
 * @param projectSubAgents - Project's configured subagents
 * @returns Array of task templates that can be executed
 */
export function getAvailableTasks(
  projectSubAgents: ProjectSubAgent[]
): TaskTemplate[] {
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
