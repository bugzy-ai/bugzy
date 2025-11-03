/**
 * Agent Library - Main Registry
 * Central export point for all agent configuration
 */

// Re-export all module types and functions
export * from '../mcp';
export * from '../tasks';
export * from '../subagents';

// Import for main resolver
import { buildMCPConfig } from '../mcp';
import { type SlashCommandConfig } from '../tasks';
import { buildSubagentsConfig, type SubagentConfig } from '../subagents';
import { type TaskDefinition, type ProjectSubAgent } from './task-builder';

/**
 * Agent Configuration Result
 * Complete configuration ready for Cloud Run API
 */
export interface AgentConfiguration {
  mcpConfig: { mcpServers: Record<string, any> };
  slashCommands: Record<string, SlashCommandConfig>;
  subagents: Record<string, SubagentConfig>;
}

/**
 * Main Configuration Resolver
 * Assembles complete agent configuration for a task execution
 *
 * This is the primary function called by the task execution route to get
 * all MCP servers, slash commands, and subagents needed for a task.
 *
 * @param taskDefinition - Complete task definition with full content
 * @param projectSubAgents - Project's configured subagents
 * @returns Complete agent configuration ready for Cloud Run
 */
export async function getAgentConfiguration(
  taskDefinition: TaskDefinition,
  projectSubAgents: ProjectSubAgent[]
): Promise<AgentConfiguration> {
  console.log(`🔧 Building agent configuration for task: ${taskDefinition.slug}`);

  // Build MCP configuration (secrets are expanded by Claude Code automatically)
  const mcpConfig = buildMCPConfig(taskDefinition.requiredMCPs);

  // Build slash commands configuration using complete task content
  // Use the full content which includes optional subagent blocks
  const slashCommands: Record<string, SlashCommandConfig> = {
    [taskDefinition.slug]: {
      frontmatter: taskDefinition.frontmatter,
      content: taskDefinition.content, // Full content with optional subagent blocks
    }
  };

  // Build subagents configuration from project's configured subagents
  // Filter to only include subagents required by this task
  const requiredSubAgents = projectSubAgents.filter(sa =>
    taskDefinition.requiredSubAgentRoles.includes(sa.role)
  );

  const subagents = buildSubagentsConfig(requiredSubAgents);

  console.log(`✓ Agent configuration complete for ${taskDefinition.slug}:`, {
    mcpServers: Object.keys(mcpConfig.mcpServers),
    slashCommands: Object.keys(slashCommands),
    subagents: Object.keys(subagents),
    requiredSubAgentRoles: taskDefinition.requiredSubAgentRoles,
  });

  return {
    mcpConfig,
    slashCommands,
    subagents,
  };
}
