/**
 * Setup Command
 * Interactive setup and reconfiguration
 */

import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { loadConfig, saveConfig, configExists, createDefaultConfig } from '../utils/config';
import { getAllSubAgents, getRequiredSubAgents } from '../../subagents';
import { createProjectStructure, updateGitignore } from '../generators/structure';
import { generateCommands } from '../generators/commands';
import { generateAgents } from '../generators/agents';
import { generateMCPConfig, getMCPServersFromSubagents } from '../generators/mcp';
import { generateEnvExample } from '../generators/env';
import { getBanner } from '../utils/banner';

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

  // Step 1: Create folder structure
  let spinner = ora('Creating project structure').start();
  await createProjectStructure();
  spinner.succeed(chalk.green('Created .bugzy/ and .claude/ directories'));

  // Step 2: Subagent configuration
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
    // Non-interactive mode: Auto-configure required subagents only
    console.log(chalk.cyan('\nConfiguring required subagents:\n'));

    const requiredSubAgents = getRequiredSubAgents();
    for (const subagent of requiredSubAgents) {
      if (subagent.integrations.length === 1) {
        subagents[subagent.role] = subagent.integrations[0].id;
        console.log(chalk.gray(`✓ ${subagent.name}: ${subagent.integrations[0].name} (required)`));
      }
    }

    console.log(chalk.gray('\n(Use "bugzy setup role=integration" to configure optional subagents)'));
  }

  // Step 3: Save configuration
  spinner = ora('Saving configuration').start();
  const projectName = path.basename(process.cwd());
  const config = createDefaultConfig(projectName);
  config.subagents = subagents;
  saveConfig(config);
  spinner.succeed(chalk.green('Saved to .bugzy/config.json'));

  // Step 4: Generate everything
  await regenerateAll(subagents);

  // Step 5: Update .gitignore (first time only)
  spinner = ora('Updating .gitignore').start();
  await updateGitignore();
  spinner.succeed(chalk.green('Updated .gitignore'));

  // Success message
  console.log(chalk.green.bold('\n✅ Setup complete!\n'));
  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.white('1. cp .env.example .env'));
  console.log(chalk.white('2. Edit .env and add your API tokens'));
  console.log(chalk.white('3. Run:'), chalk.cyan('bugzy'));
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

  console.log(chalk.gray('Current configuration:'));
  for (const [role, integration] of Object.entries(existingConfig.subagents)) {
    console.log(chalk.gray(`  • ${role}: ${integration}`));
  }
  console.log();

  // Ask which subagents to reconfigure
  const allSubAgents = getAllSubAgents();
  const newSubagents: Record<string, string> = {};

  for (const subagent of allSubAgents) {
    const currentIntegration = existingConfig.subagents[subagent.role];

    if (currentIntegration) {
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

  // Update configuration
  const spinner = ora('Updating configuration').start();
  existingConfig.subagents = newSubagents;
  await saveConfig(existingConfig);
  spinner.succeed(chalk.green('Updated .bugzy/config.json'));

  // Regenerate everything
  await regenerateAll(newSubagents);

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
 */
async function regenerateAll(subagents: Record<string, string>): Promise<void> {
  // Generate all task commands
  let spinner = ora('Generating task commands').start();
  await generateCommands(subagents);
  const taskCount = Object.keys(require('../../tasks').TASK_TEMPLATES).length;
  spinner.succeed(chalk.green(`Generated ${taskCount} task commands in .claude/commands/`));

  // Generate subagent configurations
  spinner = ora('Generating subagent configurations').start();
  await generateAgents(subagents);
  const subagentCount = Object.keys(subagents).length;
  spinner.succeed(chalk.green(`Generated ${subagentCount} subagent configurations in .claude/agents/`));

  // Generate MCP config
  spinner = ora('Generating MCP configuration').start();
  const mcpServers = getMCPServersFromSubagents(subagents);
  await generateMCPConfig(mcpServers);
  spinner.succeed(chalk.green(`Generated .mcp.json (${mcpServers.length} servers)`));

  // Generate .env.example
  spinner = ora('Creating environment template').start();
  await generateEnvExample(mcpServers);
  spinner.succeed(chalk.green('Created .env.example'));
}
