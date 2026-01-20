/**
 * YAML Serialization Utilities
 * Properly serialize YAML frontmatter using gray-matter
 */

import matter from 'gray-matter';

/**
 * Serialize markdown content with YAML frontmatter
 * Uses gray-matter for proper YAML handling (escaping quotes, multiline strings, etc.)
 *
 * @param frontmatter - Metadata to serialize as YAML frontmatter
 * @param content - Markdown content body
 * @returns Formatted markdown with properly escaped YAML frontmatter
 */
export function serializeMarkdownWithFrontmatter(
  frontmatter: Record<string, any>,
  content: string
): string {
  // Filter out null/undefined values before serialization
  const filteredFrontmatter: Record<string, any> = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined && value !== null) {
      filteredFrontmatter[key] = value;
    }
  }

  // Use gray-matter's stringify to properly handle YAML serialization
  // This handles all edge cases: quotes, newlines, XML tags, special characters
  return matter.stringify(content, filteredFrontmatter);
}
