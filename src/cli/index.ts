#!/usr/bin/env node

/**
 * Bugzy CLI Entry Point
 * Main command-line interface for Bugzy
 */

import { Command } from 'commander';
import { startSession } from './commands/start';
import { setupProject } from './commands/setup';

const program = new Command();

program
  .name('bugzy')
  .description('Open-source AI agent configuration for QA automation with Claude Code')
  .version('0.1.0');

// Setup command (explicit)
program
  .command('setup')
  .description('Setup or reconfigure project (auto-detects first-time vs existing)')
  .action(async () => {
    await setupProject();
  });

// Default command - start session (with optional prompt)
program
  .argument('[prompt...]', 'Initial prompt for Claude Code session')
  .action(async (promptArgs: string[]) => {
    const prompt = promptArgs.length > 0 ? promptArgs.join(' ') : undefined;
    await startSession(prompt);
  });

program.parse();
