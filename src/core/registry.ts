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
 * Assembles complete agent configuration for task execution
 *
 * This is the primary function called by the task execution route to get
 * all MCP servers, slash commands, and subagents needed for tasks.
 *
 * @param taskDefinitions - Array of task definitions (primary + dependents)
 * @param projectSubAgents - Project's configured subagents
 * @returns Complete agent configuration ready for Cloud Run
 */
export async function getAgentConfiguration(
  taskDefinitions: TaskDefinition[],
  projectSubAgents: ProjectSubAgent[]
): Promise<AgentConfiguration> {
  const taskSlugs = taskDefinitions.map(t => t.slug);
  console.log(`🔧 Building agent configuration for tasks: ${taskSlugs.join(', ')}`);

  // Merge all required MCPs from all tasks
  const allMCPs = new Set<string>();
  taskDefinitions.forEach(t => t.requiredMCPs.forEach(mcp => allMCPs.add(mcp)));
  const mcpConfig = buildMCPConfig(Array.from(allMCPs));

  // Build slash commands for ALL tasks (each becomes a separate command file)
  const slashCommands: Record<string, SlashCommandConfig> = {};
  taskDefinitions.forEach(task => {
    slashCommands[task.slug] = {
      frontmatter: task.frontmatter,
      content: task.content,
    };
  });

  // Merge all required subagent roles from all tasks
  const allRoles = new Set<string>();
  taskDefinitions.forEach(t => t.requiredSubAgentRoles.forEach(r => allRoles.add(r)));

  // Filter to only include subagents required by any task
  const requiredSubAgents = projectSubAgents.filter(sa => allRoles.has(sa.role));
  const subagents = buildSubagentsConfig(requiredSubAgents);

  console.log(`✓ Agent configuration complete:`, {
    tasks: taskSlugs,
    mcpServers: Object.keys(mcpConfig.mcpServers),
    slashCommands: Object.keys(slashCommands),
    subagents: Object.keys(subagents),
    requiredSubAgentRoles: Array.from(allRoles),
  });

  return {
    mcpConfig,
    slashCommands,
    subagents,
  };
}
