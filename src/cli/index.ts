#!/usr/bin/env node

/**
 * Bugzy CLI Entry Point
 * Main command-line interface for Bugzy
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { startSession } from './commands/start';
import { setupProject } from './commands/setup';
import { getBanner } from './utils/banner';

// Global error handler - catch all unhandled errors
process.on('uncaughtException', (error: Error) => {
  console.error(chalk.red('\n✗ Error:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error(chalk.red('\n✗ Error:'), reason?.message || reason);
  process.exit(1);
});

// Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);

// Handle version flag before commander processes it
if (process.argv.includes('-v') || process.argv.includes('--version')) {
  console.log(getBanner());
  console.log(chalk.cyan(`  v${packageJson.version}\n`));
  console.log(chalk.gray('  Open-source AI agent configuration for QA automation'));
  console.log(chalk.gray(`  ${packageJson.homepage}\n`));
  process.exit(0);
}

const program = new Command();

program
  .name('bugzy')
  .description('Open-source AI agent configuration for QA automation with Claude Code')
  .version(packageJson.version, '-v, --version', 'Show version number')
  .addHelpText('before', getBanner() + '\n');

// Setup command (explicit)
program
  .command('setup')
  .description('Setup or reconfigure project (auto-detects first-time vs existing)')
  .argument('[subagents...]', 'Optional subagent configurations (format: role=integration)')
  .action(async (subagentArgs: string[]) => {
    try {
      await setupProject(subagentArgs);
    } catch (error: any) {
      console.error(chalk.red('\n✗ Error:'), error.message);
      process.exit(1);
    }
  });

// Default command - start session (with optional prompt)
program
  .argument('[prompt...]', 'Initial prompt for Claude Code session')
  .action(async (promptArgs: string[]) => {
    try {
      const prompt = promptArgs.length > 0 ? promptArgs.join(' ') : undefined;
      await startSession(prompt);
    } catch (error: any) {
      console.error(chalk.red('\n✗ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
