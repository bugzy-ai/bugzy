/**
 * Sub-Agents Module
 * Server-side template loading with metadata re-exports
 */

import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
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
 * Get the package root directory
 * Uses Node's module resolution to reliably find the package root
 * Works correctly with npm, yarn, and pnpm (handles symlinks)
 */
function getPackageRoot(): string {
  try {
    // Create a require function from the current module
    // This works in both ESM and CJS contexts
    let requireFn: NodeRequire;

    try {
      // For ESM: create require from import.meta.url
      // @ts-ignore - import.meta is available in ESM context
      if (typeof import.meta !== 'undefined' && import.meta?.url) {
        // @ts-ignore
        requireFn = createRequire(import.meta.url);
      } else {
        // For CommonJS: use global require
        requireFn = require;
      }
    } catch {
      // Fallback to global require if available
      // @ts-ignore - require is available in CommonJS context
      requireFn = typeof require !== 'undefined' ? require : createRequire(__filename);
    }

    // Use Node's module resolution to find package.json
    // This works correctly even with pnpm's symlink structure
    const packageJsonPath = requireFn.resolve('@bugzy-ai/bugzy/package.json');
    return path.dirname(packageJsonPath);
  } catch (error) {
    // Fallback: try to resolve relative to current file
    // This handles development scenarios where the package isn't installed
    try {
      // @ts-ignore - import.meta is available in ESM context
      if (typeof import.meta !== 'undefined' && import.meta?.url) {
        // @ts-ignore
        const currentDir = path.dirname(fileURLToPath(import.meta.url));
        // From dist/subagents/index.js, go up to package root
        return path.join(currentDir, '../..');
      }
    } catch {
      // Do nothing, fall through
    }

    // Final fallback: use __dirname if available (CommonJS)
    // @ts-ignore - __dirname is available in CommonJS context
    if (typeof __dirname !== 'undefined') {
      // @ts-ignore
      return path.join(__dirname, '../..');
    }

    // Last resort: current working directory
    return process.cwd();
  }
}

/**
 * Load template from markdown file
 * @param role - Subagent role
 * @param integration - Integration provider
 * @returns Parsed template or undefined if not found
 */
function loadTemplate(role: string, integration: string): SubAgentTemplate | undefined {
  // Get package root using Node's module resolution
  // This works correctly with npm, yarn, and pnpm
  const packageRoot = getPackageRoot();
  const templatePath = path.join(
    packageRoot,
    'templates/subagents',
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
