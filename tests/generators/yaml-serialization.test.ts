import { describe, it, expect } from 'vitest';
import matter from 'gray-matter';
import { serializeMarkdownWithFrontmatter } from '../../src/cli/utils/yaml';

describe('serializeMarkdownWithFrontmatter', () => {
  describe('basic functionality', () => {
    it('should serialize simple strings correctly', () => {
      const frontmatter = {
        name: 'test-agent',
        description: 'A simple test agent',
      };
      const content = '# Test Agent\n\nThis is the content.';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.name).toBe('test-agent');
      expect(parsed.data.description).toBe('A simple test agent');
      expect(parsed.content.trim()).toBe(content);
    });

    it('should filter out null and undefined values', () => {
      const frontmatter = {
        name: 'test-agent',
        description: null,
        tools: undefined,
        model: 'sonnet',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.name).toBe('test-agent');
      expect(parsed.data.model).toBe('sonnet');
      expect('description' in parsed.data).toBe(false);
      expect('tools' in parsed.data).toBe(false);
    });
  });

  describe('edge cases with special characters', () => {
    it('should handle strings with embedded double quotes', () => {
      const frontmatter = {
        description: 'Agent that uses "special" tools',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe('Agent that uses "special" tools');
    });

    it('should handle strings with embedded single quotes', () => {
      const frontmatter = {
        description: "Agent that doesn't fail",
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe("Agent that doesn't fail");
    });

    it('should handle strings with both single and double quotes', () => {
      const frontmatter = {
        description: `Agent that uses "special" tools and doesn't fail`,
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe(`Agent that uses "special" tools and doesn't fail`);
    });

    it('should handle strings with newlines (multiline)', () => {
      const frontmatter = {
        description: 'Line 1\nLine 2\nLine 3',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle strings with newlines and quotes combined', () => {
      const frontmatter = {
        description: 'First "important" line\nSecond line that\'s also important\nThird line',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe(
        'First "important" line\nSecond line that\'s also important\nThird line'
      );
    });

    it('should handle strings with XML-like tags', () => {
      const frontmatter = {
        description: 'Agent with <example>XML tags</example> in description',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe('Agent with <example>XML tags</example> in description');
    });

    it('should handle complex XML-like content with nested tags', () => {
      const frontmatter = {
        description: `When testing, use:
<test-steps>
  <step>First do this</step>
  <step>Then do that</step>
</test-steps>`,
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe(frontmatter.description);
    });

    it('should handle colons in values', () => {
      const frontmatter = {
        description: 'Time: 12:00 PM',
        url: 'https://example.com',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe('Time: 12:00 PM');
      expect(parsed.data.url).toBe('https://example.com');
    });

    it('should handle special YAML characters', () => {
      const frontmatter = {
        description: 'Values with # hash and * asterisk and @ at',
        pattern: '[a-z]+',
      };
      const content = '# Test';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.description).toBe('Values with # hash and * asterisk and @ at');
      expect(parsed.data.pattern).toBe('[a-z]+');
    });
  });

  describe('round-trip parsing', () => {
    it('should survive round-trip (serialize -> parse -> compare)', () => {
      const originalFrontmatter = {
        name: 'complex-agent',
        description: 'An agent with "quoted" text\nand multiple lines',
        model: 'opus',
        tools: 'Read, Write, Bash',
      };
      const originalContent = '# Complex Agent\n\nThis agent does complex things.';

      const serialized = serializeMarkdownWithFrontmatter(originalFrontmatter, originalContent);
      const parsed = matter(serialized);

      expect(parsed.data.name).toBe(originalFrontmatter.name);
      expect(parsed.data.description).toBe(originalFrontmatter.description);
      expect(parsed.data.model).toBe(originalFrontmatter.model);
      expect(parsed.data.tools).toBe(originalFrontmatter.tools);
      expect(parsed.content.trim()).toBe(originalContent);
    });
  });

  describe('integration with real-world templates', () => {
    it('should handle azure-devops style description with XML examples', () => {
      const frontmatter = {
        name: 'issue-tracker',
        description: `Create and manage work items in Azure DevOps.

<example>
User: Create a bug for the login failure
Agent: I'll create a work item:
  - Title: Login failure bug
  - Type: Bug
  - Description: Users cannot login
</example>`,
        tools: 'mcp__azure-devops__*',
        model: 'sonnet',
      };
      const content = '# Issue Tracker\n\nYou are an issue tracker agent.';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.name).toBe('issue-tracker');
      expect(parsed.data.description).toBe(frontmatter.description);
      expect(parsed.data.tools).toBe('mcp__azure-devops__*');
      expect(parsed.content.trim()).toBe(content);
    });

    it('should handle team-communicator style with slack examples', () => {
      const frontmatter = {
        name: 'team-communicator',
        description: `Send messages to team channels.

Usage:
- "Notify the team about the deployment"
- "Post test results to #qa-channel"`,
        tools: 'mcp__slack__*, Read',
      };
      const content = '# Team Communicator\n\nPost messages to Slack.';

      const result = serializeMarkdownWithFrontmatter(frontmatter, content);
      const parsed = matter(result);

      expect(parsed.data.name).toBe('team-communicator');
      expect(parsed.data.description).toBe(frontmatter.description);
      expect(parsed.content.trim()).toBe(content);
    });
  });
});
