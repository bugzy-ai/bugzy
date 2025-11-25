/**
 * Bugzy - Open-source AI agent configuration for QA automation
 *
 * @packageDocumentation
 */

// Re-export all public APIs
export * from './core/registry';
export * from './core/task-builder';
export * from './tasks';
export * from './subagents';
export * from './mcp';

// Named exports for common use cases
export { getAgentConfiguration } from './core/registry';
export { buildTaskDefinition, getAvailableTasks } from './core/task-builder';
export { TASK_TEMPLATES, TASK_SLUGS } from './tasks';
export { SUBAGENTS, INTEGRATIONS, getAllSubAgents } from './subagents';
export { MCP_SERVERS, buildMCPConfig } from './mcp';

// Export types
export type { AgentConfiguration } from './core/registry';
export type { TaskDefinition, ProjectSubAgent } from './core/task-builder';
export type { TaskTemplate, TaskFrontmatter } from './tasks';
export type { SubAgentMetadata, SubAgentIntegration, IntegrationType } from './subagents';
export type { MCPServerConfig, MCPServerTemplate } from './mcp';
