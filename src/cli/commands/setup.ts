/**
 * Setup Command
 * Interactive setup and reconfiguration
 */

import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { loadConfig, saveConfig, configExists, createDefaultConfig } from '../utils/config';
import { getAllSubAgents, getOptionalSubAgents, getRequiredSubAgents } from '../../subagents';
import { createProjectStructure, updateGitignore } from '../generators/structure';
import { generateCommands } from '../generators/commands';
import { generateAgents } from '../generators/agents';
import { generateMCPConfig, getMCPServersFromSubagents } from '../generators/mcp';
import { generateEnvExample } from '../generators/env';

/**
 * Setup or reconfigure project
 * Auto-detects first-time vs existing based on config presence
 */
export async function setupProject(): Promise<void> {
  const isReconfigure = configExists();

  if (isReconfigure) {
    await reconfigureProject();
  } else {
    await firstTimeSetup();
  }
}

/**
 * First-time setup
 */
async function firstTimeSetup(): Promise<void> {
  console.log(chalk.cyan.bold('\n🐛 Bugzy OSS - Project Setup\n'));

  // Step 1: Create folder structure
  let spinner = ora('Creating project structure').start();
  await createProjectStructure();
  spinner.succeed(chalk.green('Created .bugzy/ and .claude/ directories'));

  // Step 2: Interactive subagent configuration
  console.log(chalk.cyan('\nConfigure subagents for your project:\n'));

  const subagents: Record<string, string> = {};

  // Required subagents (auto-configured)
  const requiredSubAgents = getRequiredSubAgents();
  for (const subagent of requiredSubAgents) {
    // If only one integration available, use it automatically
    if (subagent.integrations.length === 1) {
      subagents[subagent.role] = subagent.integrations[0].id;
      console.log(chalk.gray(`✓ ${subagent.name}: ${subagent.integrations[0].name} (required)`));
    } else {
      // Let user choose integration
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
  }

  // Optional subagents
  const optionalSubAgents = getOptionalSubAgents();
  for (const subagent of optionalSubAgents) {
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
      message: `${subagent.name} (optional) - ${subagent.description}`,
      choices
    }]);

    if (integration) {
      subagents[subagent.role] = integration;
    }
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
  console.log(chalk.cyan.bold('\n🐛 Bugzy OSS - Reconfigure\n'));

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
