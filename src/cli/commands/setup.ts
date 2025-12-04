/**
 * Setup Command
 * Interactive setup and reconfiguration
 */

import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { loadConfig, saveConfig, configExists, createDefaultConfig, DEFAULT_TOOL, getToolFromConfig } from '../utils/config';
import { getAllSubAgents, getRequiredSubAgents } from '../../subagents';
import { createProjectStructure, updateGitignore, generateClaudeMd, generateAgentsMd } from '../generators/structure';
import { generateCommands } from '../generators/commands';
import { generateAgents } from '../generators/agents';
import { generateMCPConfig, getMCPServersFromSubagents, buildCodexMCPCommand, getConfiguredCodexMCPServers } from '../generators/mcp';
import { MCP_SERVERS } from '../../mcp';
import { execSync } from 'child_process';
import { generateEnvExample } from '../generators/env';
import { getBanner } from '../utils/banner';
import { scaffoldPlaywrightProject, isPlaywrightScaffolded } from '../generators/scaffold-playwright';
import { ToolId, getToolOptions, getToolProfile } from '../../core/tool-profile';

/**
 * Parse CLI arguments in format "role=integration"
 * @param args - CLI arguments
 * @returns Parsed subagent configuration
 */
function parseSetupArgs(args: string[]): Record<string, string> {
  const subagents: Record<string, string> = {};

  for (const arg of args) {
    const match = arg.match(/^([a-z-]+)=([a-z-]+)$/);
    if (!match) {
      console.error(chalk.red(`Invalid argument format: ${arg}`));
      console.error(chalk.yellow('Expected format: role=integration (e.g., team-communicator=slack)'));
      process.exit(1);
    }

    const [, role, integration] = match;

    // Validate role exists
    const allSubAgents = getAllSubAgents();
    const subagent = allSubAgents.find(s => s.role === role);
    if (!subagent) {
      console.error(chalk.red(`Unknown subagent role: ${role}`));
      console.error(chalk.yellow('Available roles:'), allSubAgents.map(s => s.role).join(', '));
      process.exit(1);
    }

    // Validate integration exists for this role
    const validIntegration = subagent.integrations.find(i => i.id === integration);
    if (!validIntegration) {
      console.error(chalk.red(`Unknown integration "${integration}" for role "${role}"`));
      console.error(chalk.yellow('Available integrations:'), subagent.integrations.map(i => i.id).join(', '));
      process.exit(1);
    }

    subagents[role] = integration;
  }

  return subagents;
}

/**
 * Setup or reconfigure project
 * Auto-detects first-time vs existing based on config presence
 * @param cliArgs - Optional CLI arguments for non-interactive setup
 */
export async function setupProject(cliArgs: string[] = []): Promise<void> {
  const isReconfigure = configExists();

  if (isReconfigure) {
    await reconfigureProject();
  } else {
    const parsedArgs = cliArgs.length > 0 ? parseSetupArgs(cliArgs) : undefined;
    await firstTimeSetup(parsedArgs);
  }
}

/**
 * First-time setup
 * @param cliSubagents - Optional pre-parsed CLI subagent configuration
 */
async function firstTimeSetup(cliSubagents?: Record<string, string>): Promise<void> {
  console.log(getBanner());
  console.log(chalk.cyan('  Project Setup\n'));

  // Step 1: Select AI coding tool
  const toolOptions = getToolOptions();
  const { selectedTool } = await inquirer.prompt([{
    type: 'list',
    name: 'selectedTool',
    message: 'Which AI coding assistant do you use?',
    choices: toolOptions.map(opt => ({
      name: opt.hint ? `${opt.label} - ${chalk.gray(opt.hint)}` : opt.label,
      value: opt.value
    })),
    default: DEFAULT_TOOL
  }]);
  const tool: ToolId = selectedTool;
  const toolProfile = getToolProfile(tool);

  console.log(chalk.gray(`\n✓ Using ${toolProfile.name}\n`));

  // Step 2: Create folder structure
  let spinner = ora('Creating project structure').start();
  await createProjectStructure(tool);
  const toolDirName = path.dirname(toolProfile.commandsDir);
  spinner.succeed(chalk.green(`Created .bugzy/ and ${toolDirName}/ directories`));

  // Step 3: Subagent configuration
  const subagents: Record<string, string> = {};

  if (cliSubagents) {
    // CLI mode: Use provided subagents + auto-configure required ones
    console.log(chalk.cyan('\nConfiguring subagents from CLI arguments:\n'));

    // Auto-configure required subagents
    const requiredSubAgents = getRequiredSubAgents();
    for (const subagent of requiredSubAgents) {
      if (subagent.integrations.length === 1) {
        subagents[subagent.role] = subagent.integrations[0].id;
        console.log(chalk.gray(`✓ ${subagent.name}: ${subagent.integrations[0].name} (required)`));
      }
    }

    // Apply CLI-provided subagents
    for (const [role, integration] of Object.entries(cliSubagents)) {
      subagents[role] = integration;
      const subagent = getAllSubAgents().find(s => s.role === role);
      const integrationMeta = subagent?.integrations.find(i => i.id === integration);
      console.log(chalk.gray(`✓ ${subagent?.name}: ${integrationMeta?.name}`));
    }
  } else {
    // Interactive mode: Prompt for both required and optional subagents
    console.log(chalk.cyan('\nConfiguring subagents:\n'));

    const allSubAgents = getAllSubAgents();

    for (const subagent of allSubAgents) {
      if (subagent.isRequired) {
        // Auto-configure required subagents if they have only one integration
        if (subagent.integrations.length === 1) {
          subagents[subagent.role] = subagent.integrations[0].id;
          console.log(chalk.gray(`✓ ${subagent.name}: ${subagent.integrations[0].name} (required)`));
        } else {
          // Prompt for required subagents with multiple integrations
          const { integration } = await inquirer.prompt([{
            type: 'list',
            name: 'integration',
            message: `${subagent.name} (required) - ${subagent.description}`,
            choices: subagent.integrations.map(i => ({
              name: i.name,
              value: i.id
            }))
          }]);
          subagents[subagent.role] = integration;
        }
      } else {
        // Prompt for optional subagents
        const choices = [
          ...subagent.integrations.map(i => ({
            name: i.name,
            value: i.id
          })),
          { name: 'Skip (configure later)', value: null }
        ];

        const { integration } = await inquirer.prompt([{
          type: 'list',
          name: 'integration',
          message: `${subagent.name} (optional) - ${subagent.description}`,
          choices
        }]);

        if (integration) {
          subagents[subagent.role] = integration;
        }
      }
    }
  }

  // Step 3.5: Offer to install MCP packages
  const mcpServers = getMCPServersFromSubagents(subagents);
  const packagesToInstall = [...new Set(
    mcpServers.flatMap(s => MCP_SERVERS[s]?.npmPackages ?? [])
  )];

  if (packagesToInstall.length > 0) {
    console.log(chalk.cyan('\nMCP Server Packages Required:\n'));
    packagesToInstall.forEach(pkg => console.log(chalk.white(`  • ${pkg}`)));

    const { installMCP } = await inquirer.prompt([{
      type: 'confirm',
      name: 'installMCP',
      message: 'Install MCP packages globally now?',
      default: true
    }]);

    if (installMCP) {
      const spinner = ora('Installing MCP packages').start();
      try {
        execSync(`npm install -g ${packagesToInstall.join(' ')}`, { stdio: 'pipe' });
        spinner.succeed(chalk.green('MCP packages installed'));
      } catch (e) {
        spinner.fail(chalk.red('Some packages failed to install'));
        console.log(chalk.yellow('\nInstall manually: npm install -g ' + packagesToInstall.join(' ')));
      }
    } else {
      console.log(chalk.yellow('\n⚠️  MCP servers will not work until packages are installed:'));
      console.log(chalk.white(`   npm install -g ${packagesToInstall.join(' ')}\n`));
    }
  }

  // Step 4: Save configuration
  spinner = ora('Saving configuration').start();
  const projectName = path.basename(process.cwd());
  const config = createDefaultConfig(projectName, tool);
  config.subagents = subagents;
  saveConfig(config);
  spinner.succeed(chalk.green('Saved to .bugzy/config.json'));

  // Step 5: Generate everything
  await regenerateAll(subagents, tool);

  // Step 6: Generate memory file (CLAUDE.md for Claude Code, AGENTS.md for others)
  spinner = ora(`Creating ${toolProfile.memoryFile}`).start();
  if (tool === 'claude-code') {
    await generateClaudeMd();
  } else {
    await generateAgentsMd();
  }
  spinner.succeed(chalk.green(`Created ${toolProfile.memoryFile}`));

  // Step 7: Update .gitignore (first time only)
  spinner = ora('Updating .gitignore').start();
  await updateGitignore();
  spinner.succeed(chalk.green('Updated .gitignore'));

  // Step 8: Scaffold Playwright project (if test-runner is configured)
  if (subagents['test-runner'] && !isPlaywrightScaffolded(process.cwd())) {
    await scaffoldPlaywrightProject({
      projectName,
      targetDir: process.cwd(),
      config
    });
  }

  // Success message with project context guidance
  console.log(chalk.green.bold('\n✅ Setup complete!\n'));

  console.log(chalk.cyan('📋 Project Context:'));
  console.log(chalk.white('   Edit .bugzy/runtime/project-context.md to help the AI understand your project:'));
  console.log(chalk.gray('   • Project description and tech stack'));
  console.log(chalk.gray('   • Team communication channels'));
  console.log(chalk.gray('   • Bug tracking workflow'));
  console.log(chalk.gray('   • Testing conventions\n'));

  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.white('1. cp .env.example .env'));
  console.log(chalk.white('2. Edit .env and add your API tokens'));
  if (subagents['test-runner']) {
    console.log(chalk.white('3. npx playwright install (install browser binaries)'));
    console.log(chalk.white('4. Edit .bugzy/runtime/project-context.md'));
    console.log(chalk.white('5. Run:'), chalk.cyan('bugzy'));
  } else {
    console.log(chalk.white('3. Edit .bugzy/runtime/project-context.md'));
    console.log(chalk.white('4. Run:'), chalk.cyan('bugzy'));
  }
  console.log();
}

/**
 * Reconfigure existing project
 */
async function reconfigureProject(): Promise<void> {
  console.log(getBanner());
  console.log(chalk.cyan('  Reconfigure\n'));

  // Load existing config
  const existingConfig = await loadConfig();
  if (!existingConfig) {
    console.error(chalk.red('Error: Could not load existing configuration'));
    process.exit(1);
  }

  // Get current tool
  const currentTool = getToolFromConfig(existingConfig);
  const currentToolProfile = getToolProfile(currentTool);

  console.log(chalk.gray('Current configuration:'));
  console.log(chalk.gray(`  Tool: ${currentToolProfile.name}`));
  for (const [role, integration] of Object.entries(existingConfig.subagents)) {
    console.log(chalk.gray(`  • ${role}: ${integration}`));
  }
  console.log();

  // Ask if user wants to change tool
  const toolOptions = getToolOptions();
  const { changeTool } = await inquirer.prompt([{
    type: 'confirm',
    name: 'changeTool',
    message: `Keep using ${currentToolProfile.name}?`,
    default: true
  }]);

  let tool = currentTool;
  if (!changeTool) {
    const { selectedTool } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedTool',
      message: 'Which AI coding assistant do you want to use?',
      choices: toolOptions.map(opt => ({
        name: opt.hint ? `${opt.label} - ${chalk.gray(opt.hint)}` : opt.label,
        value: opt.value
      })),
      default: currentTool
    }]);
    tool = selectedTool;
    console.log(chalk.gray(`\n✓ Switching to ${getToolProfile(tool).name}\n`));
  }

  // Ask which subagents to reconfigure
  const allSubAgents = getAllSubAgents();
  const newSubagents: Record<string, string> = {};

  for (const subagent of allSubAgents) {
    const currentIntegration = existingConfig.subagents[subagent.role];

    if (currentIntegration) {
      // Auto-keep required subagents with only one integration
      if (subagent.isRequired && subagent.integrations.length === 1) {
        newSubagents[subagent.role] = subagent.integrations[0].id;
        console.log(chalk.gray(`✓ ${subagent.name}: ${subagent.integrations[0].name} (required)`));
      } else {
        // Currently configured - offer to keep, change, or remove
        const choices = [
          { name: `Keep ${currentIntegration}`, value: 'keep' },
          { name: 'Change to different integration', value: 'change' },
        ];

        // Only allow removal if not required
        if (!subagent.isRequired) {
          choices.push({ name: 'Remove', value: 'remove' });
        }

        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: `${subagent.name} (currently: ${currentIntegration})`,
          choices
        }]);

        if (action === 'keep') {
          newSubagents[subagent.role] = currentIntegration;
        } else if (action === 'change') {
          const { integration } = await inquirer.prompt([{
            type: 'list',
            name: 'integration',
            message: `Select new integration for ${subagent.name}:`,
            choices: subagent.integrations.map(i => ({
              name: i.name,
              value: i.id
            }))
          }]);
          newSubagents[subagent.role] = integration;
        }
        // If 'remove', don't add to newSubagents
      }
    } else {
      // Not currently configured - offer to add (if optional)
      if (!subagent.isRequired) {
        const choices = [
          ...subagent.integrations.map(i => ({
            name: i.name,
            value: i.id
          })),
          { name: 'None (skip)', value: null }
        ];

        const { integration } = await inquirer.prompt([{
          type: 'list',
          name: 'integration',
          message: `Add ${subagent.name}? (currently: not configured)`,
          choices
        }]);

        if (integration) {
          newSubagents[subagent.role] = integration;
        }
      } else {
        // Required but not configured - must configure
        if (subagent.integrations.length === 1) {
          // Auto-configure if only one integration
          newSubagents[subagent.role] = subagent.integrations[0].id;
          console.log(chalk.gray(`✓ ${subagent.name}: ${subagent.integrations[0].name} (required)`));
        } else {
          // Prompt if multiple integrations
          const { integration } = await inquirer.prompt([{
            type: 'list',
            name: 'integration',
            message: `${subagent.name} (required) - ${subagent.description}`,
            choices: subagent.integrations.map(i => ({
              name: i.name,
              value: i.id
            }))
          }]);
          newSubagents[subagent.role] = integration;
        }
      }
    }
  }

  // Update configuration
  let spinner = ora('Updating configuration').start();
  existingConfig.tool = tool;
  existingConfig.subagents = newSubagents;
  await saveConfig(existingConfig);
  spinner.succeed(chalk.green('Updated .bugzy/config.json'));

  // Regenerate everything
  await regenerateAll(newSubagents, tool);

  // Generate memory file (CLAUDE.md for Claude Code, AGENTS.md for others)
  const toolProfile = getToolProfile(tool);
  spinner = ora(`Creating ${toolProfile.memoryFile}`).start();
  if (tool === 'claude-code') {
    await generateClaudeMd();
  } else {
    await generateAgentsMd();
  }
  spinner.succeed(chalk.green(`Created ${toolProfile.memoryFile}`));

  // Success message
  console.log(chalk.green.bold('\n✅ Reconfiguration complete!\n'));
  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.white('1. Check .env.example for new required secrets'));
  console.log(chalk.white('2. Add new secrets to .env'));
  console.log(chalk.white('3. Run:'), chalk.cyan('bugzy'));
  console.log();
}

/**
 * Regenerate all generated files
 * @param subagents - Subagent role -> integration mapping
 * @param tool - AI coding tool (default: 'claude-code')
 */
async function regenerateAll(subagents: Record<string, string>, tool: ToolId = DEFAULT_TOOL): Promise<void> {
  const toolProfile = getToolProfile(tool);

  // Generate all task commands
  let spinner = ora('Generating task commands').start();
  await generateCommands(subagents, tool);
  const taskCount = Object.keys(require('../../tasks').TASK_TEMPLATES).length;
  spinner.succeed(chalk.green(`Generated ${taskCount} task commands in ${toolProfile.commandsDir}/`));

  // Generate subagent configurations
  spinner = ora('Generating subagent configurations').start();
  await generateAgents(subagents, tool);
  const subagentCount = Object.keys(subagents).length;
  spinner.succeed(chalk.green(`Generated ${subagentCount} subagent configurations in ${toolProfile.agentsDir}/`));

  // Generate MCP config - format varies by tool (JSON or CLI commands)
  spinner = ora('Generating MCP configuration').start();
  const mcpServers = getMCPServersFromSubagents(subagents);
  await generateMCPConfig(mcpServers, tool);

  if (toolProfile.mcpFormat === 'json') {
    spinner.succeed(chalk.green(`Generated ${toolProfile.mcpConfigPath} (${mcpServers.length} servers)`));
  } else if (toolProfile.mcpFormat === 'toml') {
    spinner.succeed(chalk.green('MCP configuration ready'));

    // Run MCP setup for Codex with user consent
    await setupCodexMCP(mcpServers);
  }

  // Generate .env.example
  spinner = ora('Creating environment template').start();
  await generateEnvExample(mcpServers);
  spinner.succeed(chalk.green('Created .env.example'));
}

/**
 * Setup MCP servers for Codex CLI
 * Runs `codex mcp add` commands for servers not already configured
 * Note: No confirmation needed since this writes to local .codex/mcp.json
 *
 * @param mcpServers - List of MCP server names to configure
 */
async function setupCodexMCP(mcpServers: string[]): Promise<void> {
  // Check which servers already exist
  const existingServers = await getConfiguredCodexMCPServers();
  const newServers = mcpServers.filter((s) => !existingServers.includes(s));

  if (newServers.length === 0) {
    console.log(chalk.gray('\n✓ All MCP servers already configured'));
    return;
  }

  // Run codex mcp add for each new server (local config, no consent needed)
  console.log();
  for (const serverName of newServers) {
    const spinner = ora(`Configuring ${serverName}`).start();
    try {
      const { args } = buildCodexMCPCommand(serverName);
      execSync(['codex', ...args].join(' '), {
        stdio: 'pipe',
        env: { ...process.env, CODEX_HOME: path.join(process.cwd(), '.codex') },
      });
      spinner.succeed(chalk.green(`Configured ${serverName}`));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to configure ${serverName}`));
      console.error(chalk.gray((error as Error).message));
    }
  }
}
