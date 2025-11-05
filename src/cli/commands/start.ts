/**
 * Start Command
 * Fast session start with minimal overhead
 */

import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../utils/config';
import { loadEnvFiles, validateEnvVars } from '../utils/env';
import { validateProjectStructure, getRequiredMCPs, checkClaudeAvailable } from '../utils/validation';
import { getBanner } from '../utils/banner';

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

  // Step 2: Validate project structure
  spinner = ora('Validating project structure').start();
  try {
    validateProjectStructure();
    spinner.succeed(chalk.green('Project structure validated'));
  } catch (error) {
    spinner.fail(chalk.red('Invalid project structure'));
    console.error(chalk.red('\n' + (error as Error).message));
    console.log(chalk.yellow('\nRun'), chalk.cyan('bugzy setup'), chalk.yellow('to fix the project structure'));
    process.exit(1);
  }

  // Step 3: Check Claude Code availability
  spinner = ora('Checking Claude Code availability').start();
  const claudeAvailable = await checkClaudeAvailable();
  if (!claudeAvailable) {
    spinner.fail(chalk.red('Claude Code CLI not found'));
    console.log(chalk.yellow('\nPlease install Claude Code:'));
    console.log(chalk.cyan('  https://claude.com/claude-code'));
    process.exit(1);
  }
  spinner.succeed(chalk.green('Claude Code CLI found'));

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

  // Step 6: Launch Claude Code
  console.log(chalk.green.bold('\n🚀 Launching Claude Code...\n'));

  const args = prompt ? [prompt] : [];
  const claude = spawn('claude', args, {
    cwd: process.cwd(),
    env: { ...process.env, ...envVars },
    stdio: 'inherit'
  });

  claude.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✓ Session ended successfully'));
    } else {
      console.log(chalk.yellow(`\n✓ Session ended (exit code: ${code})`));
    }
  });

  claude.on('error', (error) => {
    console.error(chalk.red('\n✗ Error launching Claude Code:'), error);
    process.exit(1);
  });
}
