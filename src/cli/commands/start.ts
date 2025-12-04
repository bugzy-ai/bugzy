/**
 * Start Command
 * Fast session start with minimal overhead
 */

import { spawn } from 'child_process';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, getToolFromConfig } from '../utils/config';
import { loadEnvFiles, validateEnvVars } from '../utils/env';
import { validateProjectStructure, getRequiredMCPs, checkToolAvailable } from '../utils/validation';
import { getBanner } from '../utils/banner';
import { getToolProfile } from '../../core/tool-profile';

/**
 * Start a Claude Code session
 * Validates configuration, loads environment, and launches Claude
 *
 * @param prompt - Optional initial prompt for Claude
 */
export async function startSession(prompt?: string): Promise<void> {
  console.log(getBanner());
  console.log(chalk.cyan('  Starting session\n'));

  // Step 1: Load configuration
  let spinner = ora('Loading configuration').start();
  const config = await loadConfig();

  if (!config) {
    spinner.fail(chalk.red('Configuration not found'));
    console.log(chalk.yellow('\nRun'), chalk.cyan('bugzy setup'), chalk.yellow('to initialize your project'));
    process.exit(1);
  }

  spinner.succeed(chalk.green('Configuration loaded'));

  // Get tool profile for the configured tool
  const tool = getToolFromConfig(config);
  const toolProfile = getToolProfile(tool);

  // Step 2: Validate project structure
  spinner = ora('Validating project structure').start();
  try {
    await validateProjectStructure();
    spinner.succeed(chalk.green('Project structure validated'));
  } catch (error) {
    spinner.fail(chalk.red('Invalid project structure'));
    console.error(chalk.red('\n' + (error as Error).message));
    console.log(chalk.yellow('\nRun'), chalk.cyan('bugzy setup'), chalk.yellow('to fix the project structure'));
    process.exit(1);
  }

  // Step 3: Check CLI tool availability
  spinner = ora(`Checking ${toolProfile.name} availability`).start();
  const toolAvailable = await checkToolAvailable(toolProfile.cliCommand);
  if (!toolAvailable) {
    spinner.fail(chalk.red(`${toolProfile.name} CLI not found`));
    console.log(chalk.yellow(`\nPlease install ${toolProfile.name}:`));
    if (tool === 'claude-code') {
      console.log(chalk.cyan('  https://claude.com/claude-code'));
    } else if (tool === 'cursor') {
      console.log(chalk.cyan('  https://www.cursor.com/'));
    } else if (tool === 'codex') {
      console.log(chalk.cyan('  npm install -g @openai/codex'));
    }
    process.exit(1);
  }
  spinner.succeed(chalk.green(`${toolProfile.name} CLI found`));

  // Step 4: Load environment variables
  spinner = ora('Loading environment variables').start();
  const envVars = loadEnvFiles();
  const envCount = Object.keys(envVars).length;
  spinner.succeed(chalk.green(`Loaded ${envCount} environment variables`));

  // Step 5: Validate required MCP secrets
  spinner = ora('Validating MCP secrets').start();
  const requiredMCPs = getRequiredMCPs(config.subagents);
  const missingVars = validateEnvVars(requiredMCPs, envVars);

  if (missingVars.length > 0) {
    spinner.fail(chalk.red('Missing required MCP secrets'));
    console.log(chalk.red('\n✗ Missing required environment variables:'));
    missingVars.forEach(v => console.log(chalk.red(`  - ${v}`)));
    console.log(chalk.yellow('\nAdd these to your .env file (see .env.example for template)'));
    console.log(chalk.gray('\nExample:'));
    console.log(chalk.cyan(`  echo "${missingVars[0]}=your-value-here" >> .env`));
    process.exit(1);
  }

  spinner.succeed(chalk.green('All required MCP secrets present'));

  // Step 6: Launch CLI tool
  console.log(chalk.green.bold(`\n🚀 Launching ${toolProfile.name}...\n`));

  const args = prompt ? [prompt] : [];

  // Build environment with tool-specific home directory
  const spawnEnv: Record<string, string | undefined> = { ...process.env, ...envVars };
  if (toolProfile.homeEnvVar) {
    // Codex expects CODEX_HOME to point to the .codex directory
    spawnEnv[toolProfile.homeEnvVar] = path.join(process.cwd(), '.codex');
  }

  const child = spawn(toolProfile.cliCommand, args, {
    cwd: process.cwd(),
    env: spawnEnv,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✓ Session ended successfully'));
    } else {
      console.log(chalk.yellow(`\n✓ Session ended (exit code: ${code})`));
    }
  });

  child.on('error', (error) => {
    console.error(chalk.red(`\n✗ Error launching ${toolProfile.name}:`), error);
    process.exit(1);
  });
}
