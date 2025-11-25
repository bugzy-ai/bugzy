/**
 * Sub-Agents Module
 * Template registry with metadata re-exports
 */

import { getTemplate } from './templates';
import type { SubagentConfig } from './types';

// Re-export all metadata (client-safe)
export * from './metadata';
export type { SubAgentIntegration, SubAgentMetadata, IntegrationType } from './metadata';

// Re-export types
export type { SubagentFrontmatter, SubagentTemplate, SubagentConfig } from './types';

// Re-export template functions
export { getTemplate, hasTemplate, getIntegrationsForRole, getRoles } from './templates';

// Deprecated: Keep for backward compatibility
export interface SubAgentTemplate {
  frontmatter: Record<string, any>;
  content: string;
}


/**
 * Build subagent configuration for Cloud Run
 * Converts role+integration to the format expected by cloudrun-claude-code API
 */
export function buildSubagentConfig(role: string, integration: string): SubagentConfig | undefined {
  const template = getTemplate(role, integration);
  if (!template) {
    console.warn(`No template found for ${role} with integration ${integration}`);
    return undefined;
  }

  return {
    frontmatter: template.frontmatter,
    content: template.content,
  };
}

/**
 * Build subagents configuration for Cloud Run from list of role+integration pairs
 */
export function buildSubagentsConfig(
  subagents: Array<{ role: string; integration: string }>
): Record<string, SubagentConfig> {
  const configs: Record<string, SubagentConfig> = {};

  for (const { role, integration } of subagents) {
    const config = buildSubagentConfig(role, integration);
    if (config) {
      configs[role] = config;
      console.log(`✓ Added subagent: ${role} (${integration})`);
    }
  }

  return configs;
}
