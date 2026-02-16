/**
 * Subagent Template Registry
 * Central index of all subagent templates organized by role and integration
 */

import type { SubagentTemplate } from '../types';

// Browser Automation templates
import * as BrowserAutomationPlaywright from './browser-automation/playwright';

// Test Engineer templates
import * as TestEngineerDefault from './test-engineer/default';

// Team Communicator templates
import * as TeamCommunicatorLocal from './team-communicator/local';
import * as TeamCommunicatorSlack from './team-communicator/slack';
import * as TeamCommunicatorTeams from './team-communicator/teams';
import * as TeamCommunicatorEmail from './team-communicator/email';

// Documentation Researcher templates
import * as DocumentationResearcherNotion from './documentation-researcher/notion';
import * as DocumentationResearcherConfluence from './documentation-researcher/confluence';
import * as DocumentationResearcherJira from './documentation-researcher/jira';

// Issue Tracker templates
import * as IssueTrackerLinear from './issue-tracker/linear';
import * as IssueTrackerJira from './issue-tracker/jira';
import * as IssueTrackerJiraServer from './issue-tracker/jira-server';
import * as IssueTrackerAzureDevOps from './issue-tracker/azure-devops';
import * as IssueTrackerNotion from './issue-tracker/notion';
import * as IssueTrackerSlack from './issue-tracker/slack';

// Changelog Historian templates
import * as ChangelogHistorianGithub from './changelog-historian/github';

/**
 * Template registry organized by role and integration
 */
export const TEMPLATES: Record<string, Record<string, SubagentTemplate>> = {
  'browser-automation': {
    playwright: {
      frontmatter: BrowserAutomationPlaywright.FRONTMATTER,
      content: BrowserAutomationPlaywright.CONTENT,
    },
  },
  'test-engineer': {
    default: {
      frontmatter: TestEngineerDefault.FRONTMATTER,
      content: TestEngineerDefault.CONTENT,
    },
  },
  'team-communicator': {
    local: {
      frontmatter: TeamCommunicatorLocal.FRONTMATTER,
      content: TeamCommunicatorLocal.CONTENT,
    },
    slack: {
      frontmatter: TeamCommunicatorSlack.FRONTMATTER,
      content: TeamCommunicatorSlack.CONTENT,
    },
    teams: {
      frontmatter: TeamCommunicatorTeams.FRONTMATTER,
      content: TeamCommunicatorTeams.CONTENT,
    },
    email: {
      frontmatter: TeamCommunicatorEmail.FRONTMATTER,
      content: TeamCommunicatorEmail.CONTENT,
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
    jira: {
      frontmatter: DocumentationResearcherJira.FRONTMATTER,
      content: DocumentationResearcherJira.CONTENT,
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
    'jira-server': {
      frontmatter: IssueTrackerJiraServer.FRONTMATTER,
      content: IssueTrackerJiraServer.CONTENT,
    },
    'azure-devops': {
      frontmatter: IssueTrackerAzureDevOps.FRONTMATTER,
      content: IssueTrackerAzureDevOps.CONTENT,
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
  'changelog-historian': {
    github: {
      frontmatter: ChangelogHistorianGithub.FRONTMATTER,
      content: ChangelogHistorianGithub.CONTENT,
    },
  },
};

/**
 * Get a template by role and integration
 * @param role - Subagent role (e.g., 'browser-automation')
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
