/**
 * Subagent Template Registry
 * Central index of all subagent templates organized by role and integration
 */

import type { SubagentTemplate } from '../types';

// Test Runner templates
import * as TestRunnerPlaywright from './test-runner/playwright';
import * as TestRunnerPuppeteer from './test-runner/puppeteer';

// Test Code Generator templates
import * as TestCodeGeneratorPlaywright from './test-code-generator/playwright';

// Team Communicator templates
import * as TeamCommunicatorSlack from './team-communicator/slack';

// Documentation Researcher templates
import * as DocumentationResearcherNotion from './documentation-researcher/notion';
import * as DocumentationResearcherConfluence from './documentation-researcher/confluence';

// Issue Tracker templates
import * as IssueTrackerLinear from './issue-tracker/linear';
import * as IssueTrackerJira from './issue-tracker/jira';
import * as IssueTrackerNotion from './issue-tracker/notion';
import * as IssueTrackerSlack from './issue-tracker/slack';

/**
 * Template registry organized by role and integration
 */
export const TEMPLATES: Record<string, Record<string, SubagentTemplate>> = {
  'test-runner': {
    playwright: {
      frontmatter: TestRunnerPlaywright.FRONTMATTER,
      content: TestRunnerPlaywright.CONTENT,
    },
    puppeteer: {
      frontmatter: TestRunnerPuppeteer.FRONTMATTER,
      content: TestRunnerPuppeteer.CONTENT,
    },
  },
  'test-code-generator': {
    playwright: {
      frontmatter: TestCodeGeneratorPlaywright.FRONTMATTER,
      content: TestCodeGeneratorPlaywright.CONTENT,
    },
  },
  'team-communicator': {
    slack: {
      frontmatter: TeamCommunicatorSlack.FRONTMATTER,
      content: TeamCommunicatorSlack.CONTENT,
    },
  },
  'documentation-researcher': {
    notion: {
      frontmatter: DocumentationResearcherNotion.FRONTMATTER,
      content: DocumentationResearcherNotion.CONTENT,
    },
    confluence: {
      frontmatter: DocumentationResearcherConfluence.FRONTMATTER,
      content: DocumentationResearcherConfluence.CONTENT,
    },
  },
  'issue-tracker': {
    linear: {
      frontmatter: IssueTrackerLinear.FRONTMATTER,
      content: IssueTrackerLinear.CONTENT,
    },
    jira: {
      frontmatter: IssueTrackerJira.FRONTMATTER,
      content: IssueTrackerJira.CONTENT,
    },
    notion: {
      frontmatter: IssueTrackerNotion.FRONTMATTER,
      content: IssueTrackerNotion.CONTENT,
    },
    slack: {
      frontmatter: IssueTrackerSlack.FRONTMATTER,
      content: IssueTrackerSlack.CONTENT,
    },
  },
};

/**
 * Get a template by role and integration
 * @param role - Subagent role (e.g., 'test-runner')
 * @param integration - Integration provider (e.g., 'playwright')
 * @returns Template or undefined if not found
 */
export function getTemplate(role: string, integration: string): SubagentTemplate | undefined {
  return TEMPLATES[role]?.[integration];
}

/**
 * Check if a template exists for a given role and integration
 * @param role - Subagent role
 * @param integration - Integration provider
 * @returns True if template exists
 */
export function hasTemplate(role: string, integration: string): boolean {
  return Boolean(TEMPLATES[role]?.[integration]);
}

/**
 * Get all available integrations for a role
 * @param role - Subagent role
 * @returns Array of integration names
 */
export function getIntegrationsForRole(role: string): string[] {
  return Object.keys(TEMPLATES[role] || {});
}

/**
 * Get all available roles
 * @returns Array of role names
 */
export function getRoles(): string[] {
  return Object.keys(TEMPLATES);
}
