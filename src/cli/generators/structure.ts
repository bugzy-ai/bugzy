/**
 * Project Structure Generator
 * Create .bugzy/ folder structure and scaffold files
 */

import * as fs from 'fs';
import * as path from 'path';
import { ToolId, getToolProfile, DEFAULT_TOOL } from '../../core/tool-profile';

/**
 * Create project folder structure
 * Creates .bugzy/ and tool-specific directories with initial files
 *
 * @param tool - AI coding tool (default: 'claude-code')
 */
export async function createProjectStructure(tool: ToolId = DEFAULT_TOOL): Promise<void> {
  const cwd = process.cwd();
  const toolProfile = getToolProfile(tool);

  // Create .bugzy/ structure (common to all tools)
  const bugzyDirs = [
    '.bugzy',
    '.bugzy/runtime',
    '.bugzy/runtime/templates'
  ];

  for (const dir of bugzyDirs) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Create tool-specific directory structure
  const toolDirs = [
    path.dirname(toolProfile.commandsDir), // .claude, .cursor, or .codex
    toolProfile.commandsDir,               // .claude/commands, .cursor/commands, .codex/prompts
    toolProfile.agentsDir                  // .claude/agents, .cursor/agents, .codex/agents
  ];

  for (const dir of toolDirs) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Create initial runtime files
  await createRuntimeFiles();
}

/**
 * Get the path to the package templates directory
 */
function getTemplatesDir(): string {
  // When running from bundled dist/cli/index.js, templates are at package root
  // dist/cli/index.js -> ../../templates
  return path.join(__dirname, '../../templates/init');
}

/**
 * Create initial runtime files in .bugzy/runtime/
 */
async function createRuntimeFiles(): Promise<void> {
  const cwd = process.cwd();
  const templatesDir = getTemplatesDir();

  // Create project-context.md from template
  const projectContextPath = path.join(cwd, '.bugzy/runtime/project-context.md');
  if (!fs.existsSync(projectContextPath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/project-context.md');
    let content = fs.readFileSync(templatePath, 'utf-8');

    // Replace template variables
    const projectName = path.basename(cwd);
    content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    content = content.replace(/\{\{CUSTOMER_NAME\}\}/g, '[To be filled]');
    content = content.replace(/\{\{BUG_TRACKING_SYSTEM\}\}/g, '[To be filled]');
    content = content.replace(/\{\{DOCUMENTATION_SYSTEM\}\}/g, '[To be filled]');

    fs.writeFileSync(projectContextPath, content, 'utf-8');
  }

  // Create test-plan-template.md from template
  const testPlanTemplatePath = path.join(cwd, '.bugzy/runtime/templates/test-plan-template.md');
  if (!fs.existsSync(testPlanTemplatePath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/templates/test-plan-template.md');
    const content = fs.readFileSync(templatePath, 'utf-8');
    fs.writeFileSync(testPlanTemplatePath, content, 'utf-8');
  }

  // Create testing-best-practices.md from template
  const bestPracticesPath = path.join(cwd, '.bugzy/runtime/testing-best-practices.md');
  if (!fs.existsSync(bestPracticesPath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/testing-best-practices.md');
    const content = fs.readFileSync(templatePath, 'utf-8');
    fs.writeFileSync(bestPracticesPath, content, 'utf-8');
  }

  // Create test-result-schema.md from template
  const testResultSchemaPath = path.join(cwd, '.bugzy/runtime/templates/test-result-schema.md');
  if (!fs.existsSync(testResultSchemaPath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/templates/test-result-schema.md');
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(testResultSchemaPath, content, 'utf-8');
    }
  }

  // Create knowledge-base.md from template
  const knowledgeBasePath = path.join(cwd, '.bugzy/runtime/knowledge-base.md');
  if (!fs.existsSync(knowledgeBasePath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/knowledge-base.md');
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(knowledgeBasePath, content, 'utf-8');
    }
  }

  // Create knowledge-maintenance-guide.md from template
  const knowledgeMaintenancePath = path.join(cwd, '.bugzy/runtime/knowledge-maintenance-guide.md');
  if (!fs.existsSync(knowledgeMaintenancePath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/knowledge-maintenance-guide.md');
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(knowledgeMaintenancePath, content, 'utf-8');
    }
  }

  // Create subagent-memory-guide.md from template
  const subagentMemoryPath = path.join(cwd, '.bugzy/runtime/subagent-memory-guide.md');
  if (!fs.existsSync(subagentMemoryPath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/subagent-memory-guide.md');
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(subagentMemoryPath, content, 'utf-8');
    }
  }

  // Create test-execution-strategy.md from template
  const testExecutionStrategyPath = path.join(cwd, '.bugzy/runtime/test-execution-strategy.md');
  if (!fs.existsSync(testExecutionStrategyPath)) {
    const templatePath = path.join(templatesDir, '.bugzy/runtime/test-execution-strategy.md');
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(testExecutionStrategyPath, content, 'utf-8');
    }
  }

  // Create .env.testdata from template
  const envTestdataPath = path.join(cwd, '.env.testdata');
  if (!fs.existsSync(envTestdataPath)) {
    const templatePath = path.join(templatesDir, '.env.testdata');
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      fs.writeFileSync(envTestdataPath, content, 'utf-8');
    }
  }
}

/**
 * Generate CLAUDE.md in project root from template
 * Used for Claude Code tool
 */
export async function generateClaudeMd(): Promise<void> {
  const cwd = process.cwd();
  const templatesDir = getTemplatesDir();
  const claudeMdPath = path.join(cwd, 'CLAUDE.md');

  // Only create if it doesn't exist (don't overwrite user modifications)
  if (!fs.existsSync(claudeMdPath)) {
    const templatePath = path.join(templatesDir, 'CLAUDE.md');
    const content = fs.readFileSync(templatePath, 'utf-8');
    fs.writeFileSync(claudeMdPath, content, 'utf-8');
  }
}

/**
 * Generate AGENTS.md in project root from template
 * Used for Cursor and Codex tools (equivalent to CLAUDE.md for Claude Code)
 */
export async function generateAgentsMd(): Promise<void> {
  const cwd = process.cwd();
  const templatesDir = getTemplatesDir();
  const agentsMdPath = path.join(cwd, 'AGENTS.md');

  // Only create if it doesn't exist (don't overwrite user modifications)
  if (!fs.existsSync(agentsMdPath)) {
    const templatePath = path.join(templatesDir, 'AGENTS.md');
    const content = fs.readFileSync(templatePath, 'utf-8');
    fs.writeFileSync(agentsMdPath, content, 'utf-8');
  }
}

/**
 * Update .gitignore to include Bugzy entries
 */
export async function updateGitignore(): Promise<void> {
  const cwd = process.cwd();
  const gitignorePath = path.join(cwd, '.gitignore');
  const templatesDir = getTemplatesDir();

  // Load bugzy entries from template
  const templatePath = path.join(templatesDir, '.gitignore-template');
  const bugzyEntries = fs.readFileSync(templatePath, 'utf-8');

  // If .gitignore exists, append entries if not already present
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes('# Bugzy')) {
      fs.appendFileSync(gitignorePath, bugzyEntries);
    }
  } else {
    // Create new .gitignore
    fs.writeFileSync(gitignorePath, bugzyEntries.trim() + '\n');
  }
}
