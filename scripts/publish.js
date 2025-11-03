#!/usr/bin/env node

/**
 * Publish script that loads .env before publishing to GitHub Packages
 * This ensures GITHUB_TOKEN is available for authentication
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Load .env file
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    console.log(`Loading environment from ${envFile}`);
    config({ path: envFile });
    break;
  }
}

// Check if GITHUB_TOKEN is set
if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN not found in environment or .env file');
  console.error('Please set GITHUB_TOKEN in your .env file or environment');
  process.exit(1);
}

// Run pnpm publish
try {
  console.log('Publishing to GitHub Packages...');
  execSync('pnpm publish --no-git-checks', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✓ Published successfully');
} catch (error) {
  console.error('✗ Publish failed');
  process.exit(1);
}
