/**
 * Sub-Agents Module
 * Server-side template loading with metadata re-exports
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Re-export all metadata (client-safe)
export * from './metadata';
export type { SubAgentIntegration, SubAgentMetadata } from './metadata';

/**
 * Sub-agent template content for a specific integration
 */
export interface SubAgentTemplate {
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Sub-agent configuration for Cloud Run
 */
export interface SubagentConfig {
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Parse markdown frontmatter and content
 * @param markdown - Raw markdown with YAML frontmatter
 * @returns Parsed frontmatter and content
 */
function parseFrontmatter(markdown: string): { frontmatter: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    // No frontmatter found, return empty frontmatter and full content
    return { frontmatter: {}, content: markdown };
  }

  const [, frontmatterText, content] = match;

  // Simple YAML parser for our use case (key: value pairs)
  const frontmatter: Record<string, any> = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value: any = line.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }

      frontmatter[key] = value;
    }
  });

  return { frontmatter, content };
}

/**
 * Get the directory containing this module
 * Works in both CommonJS and ESM contexts
 */
function getModuleDir(): string {
  try {
    // For ESM (when import.meta.url is available)
    // @ts-ignore - import.meta is available in ESM context
    if (typeof import.meta !== 'undefined' && import.meta?.url) {
      // @ts-ignore
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Fall through to CommonJS
  }

  // For CommonJS
  // @ts-ignore - __dirname is available in CommonJS context
  return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
}

/**
 * Load template from markdown file
 * @param role - Subagent role
 * @param integration - Integration provider
 * @returns Parsed template or undefined if not found
 */
function loadTemplate(role: string, integration: string): SubAgentTemplate | undefined {
  // Resolve template path relative to this module (works in npm package)
  // In production, templates are at: node_modules/bugzy/dist/subagents/templates/
  const moduleDir = getModuleDir();
  const templatePath = path.join(
    moduleDir,
    'templates',
    role,
    `${integration}.md`
  );

  if (!fs.existsSync(templatePath)) {
    console.warn(`Template not found: ${templatePath}`);
    return undefined;
  }

  try {
    const markdown = fs.readFileSync(templatePath, 'utf-8');
    const { frontmatter, content } = parseFrontmatter(markdown);
    return { frontmatter, content };
  } catch (error) {
    console.error(`Error loading template ${templatePath}:`, error);
    return undefined;
  }
}

/**
 * Build subagent configuration for Cloud Run
 * Converts role+integration to the format expected by cloudrun-claude-code API
 */
export function buildSubagentConfig(role: string, integration: string): SubagentConfig | undefined {
  const template = loadTemplate(role, integration);
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
