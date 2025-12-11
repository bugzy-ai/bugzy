/**
 * Playwright Project Scaffolding
 * Generates complete Playwright test automation project structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { BugzyConfig } from '../utils/config';

export interface ScaffoldOptions {
  projectName: string;
  targetDir: string;
  config: BugzyConfig;
  skipInstall?: boolean;
}

/**
 * Main scaffolding function
 * Creates complete Playwright project structure with best practices
 */
export async function scaffoldPlaywrightProject(options: ScaffoldOptions): Promise<void> {
  const { projectName, targetDir, skipInstall = false } = options;

  console.log('\n🎭 Scaffolding Playwright test automation project...\n');

  // Step 1: Create directory structure
  await createDirectoryStructure(targetDir);

  // Step 2: Create or update package.json with dependencies
  const needsInstall = await createPackageJson(targetDir, projectName);

  // Step 3: Copy and process template files
  await copyTemplateFiles(targetDir, projectName);

  // Step 4: Update .gitignore
  await updateGitignore(targetDir);

  // Step 5: Install dependencies if needed
  if (needsInstall && !skipInstall) {
    await installDependencies(targetDir);
  }

  console.log('  ✓ Playwright project scaffolded');
}

/**
 * Create the directory structure for Playwright tests
 */
async function createDirectoryStructure(targetDir: string): Promise<void> {
  const directories = [
    'tests/specs',
    'tests/pages',
    'tests/components',
    'tests/fixtures',
    'tests/helpers',
    'tests/types',
    'tests/setup',
    'tests/data',
    'tests/.auth',
    'reporters',
    'test-runs',
  ];

  for (const dir of directories) {
    const fullPath = path.join(targetDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created ${dir}/`);
    }
  }
}

/**
 * Copy template files and process placeholders
 */
async function copyTemplateFiles(targetDir: string, projectName: string): Promise<void> {
  // Try multiple possible template locations (for development vs production)
  const possiblePaths = [
    path.join(__dirname, '../../templates/playwright'),  // When running from dist
    path.join(process.cwd(), 'templates/playwright'),     // When running from project root
    path.join(__dirname, '../../../templates/playwright'), // When running tests
  ];

  let templatesDir = '';
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      templatesDir = possiblePath;
      break;
    }
  }

  if (!templatesDir) {
    throw new Error('Templates directory not found. Searched paths: ' + possiblePaths.join(', '));
  }

  // Copy test-runs/README.md from init templates (if available)
  const initTemplatesDir = path.join(__dirname, '../../templates/init');
  const testRunsReadmeSrc = path.join(initTemplatesDir, 'test-runs/README.md');
  const testRunsReadmeDest = path.join(targetDir, 'test-runs/README.md');
  if (fs.existsSync(testRunsReadmeSrc)) {
    const content = fs.readFileSync(testRunsReadmeSrc, 'utf-8');
    fs.writeFileSync(testRunsReadmeDest, content, 'utf-8');
    console.log(`  ✓ Created test-runs/README.md`);
  }

  // Template files and their destinations
  const templates = [
    {
      src: 'playwright.config.template.ts',
      dest: 'playwright.config.ts',
      process: true,
    },
    {
      src: 'reporters/bugzy-reporter.ts',
      dest: 'reporters/bugzy-reporter.ts',
      process: false,
    },
    {
      src: 'BasePage.template.ts',
      dest: 'tests/pages/BasePage.ts',
      process: true,
    },
    {
      src: 'pages.fixture.template.ts',
      dest: 'tests/fixtures/pages.fixture.ts',
      process: true,
    },
    {
      src: 'auth.setup.template.ts',
      dest: 'tests/setup/auth.setup.ts',
      process: true,
    },
    {
      src: 'dateUtils.helper.template.ts',
      dest: 'tests/helpers/dateUtils.ts',
      process: true,
    },
    {
      src: 'dataGenerators.helper.template.ts',
      dest: 'tests/helpers/dataGenerators.ts',
      process: true,
    },
  ];

  for (const template of templates) {
    const srcPath = path.join(templatesDir, template.src);
    const destPath = path.join(targetDir, template.dest);

    if (fs.existsSync(srcPath)) {
      let content = fs.readFileSync(srcPath, 'utf-8');

      // Process placeholders
      if (template.process) {
        content = processTemplate(content, {
          PROJECT_NAME: projectName,
          BASE_URL: 'http://localhost:3000',
          DATE: new Date().toISOString().split('T')[0],
        });
      }

      // Ensure destination directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.writeFileSync(destPath, content, 'utf-8');
      console.log(`  ✓ Created ${template.dest}`);
    } else {
      console.warn(`  ⚠️  Template not found: ${template.src}`);
    }
  }
}

/**
 * Process template content by replacing placeholders
 */
function processTemplate(content: string, values: Record<string, string>): string {
  let processed = content;

  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), value);
  }

  return processed;
}

/**
 * Update .gitignore to include Playwright-specific entries
 */
async function updateGitignore(targetDir: string): Promise<void> {
  const gitignorePath = path.join(targetDir, '.gitignore');

  const playwrightEntries = `
# Playwright
test-results/
playwright-report/
tests/.auth/
.env
`;

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');

    // Only add if not already present
    if (!content.includes('# Playwright')) {
      fs.appendFileSync(gitignorePath, playwrightEntries);
      console.log('  ✓ Updated .gitignore');
    }
  } else {
    // Create new .gitignore
    fs.writeFileSync(gitignorePath, playwrightEntries, 'utf-8');
    console.log('  ✓ Created .gitignore');
  }
}

/**
 * Create or update package.json with recommended dependencies
 * @returns true if dependencies were added (need to run install), false otherwise
 */
async function createPackageJson(targetDir: string, projectName: string): Promise<boolean> {
  const packageJsonPath = path.join(targetDir, 'package.json');

  const recommendedDeps = {
    '@playwright/test': '^1.48.0',
    '@types/node': '^20.0.0',
    'allure-playwright': '^3.0.0',
    typescript: '^5.3.0',
    dotenv: '^16.3.1',
    eslint: '^8.56.0',
    prettier: '^3.1.0',
  };

  if (!fs.existsSync(packageJsonPath)) {
    // Create new package.json
    const packageJson = {
      name: projectName,
      version: '1.0.0',
      description: 'Automated test suite powered by Playwright',
      scripts: {
        test: 'playwright test',
        'test:ui': 'playwright test --ui',
        'test:debug': 'playwright test --debug',
        'test:report': 'playwright show-report',
      },
      keywords: ['testing', 'playwright', 'automation', 'e2e'],
      devDependencies: recommendedDeps,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log('  ✓ Created package.json');
    return true; // New file created, need install
  } else {
    // Merge missing dependencies into existing package.json
    const existing = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    existing.devDependencies = existing.devDependencies || {};

    let addedCount = 0;
    const addedPackages: string[] = [];

    for (const [pkg, version] of Object.entries(recommendedDeps)) {
      // Check if package exists in either devDependencies or dependencies
      if (!existing.devDependencies[pkg] && !existing.dependencies?.[pkg]) {
        existing.devDependencies[pkg] = version;
        addedCount++;
        addedPackages.push(pkg);
      }
    }

    if (addedCount > 0) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
      console.log(`  ✓ Added ${addedCount} missing dependencies to package.json`);
      console.log(`    ${addedPackages.join(', ')}`);
      return true; // Modified, need install
    } else {
      console.log('  ✓ All recommended dependencies already present');
      return false; // No install needed
    }
  }
}

/**
 * Install all dependencies using detected package manager
 */
async function installDependencies(targetDir: string): Promise<void> {
  try {
    const packageManager = detectPackageManager(targetDir);
    console.log(`\n  📦 Installing dependencies using ${packageManager}...`);

    const installCommand =
      packageManager === 'pnpm'
        ? 'pnpm install'
        : packageManager === 'yarn'
          ? 'yarn install'
          : 'npm install';

    execSync(installCommand, {
      cwd: targetDir,
      stdio: 'inherit',
    });

    console.log('  ✓ Dependencies installed successfully\n');
  } catch (error) {
    console.error('  ⚠️  Failed to install dependencies:', error);
    console.log('     Please run "npm install" manually\n');
  }
}

/**
 * Detect which package manager is being used
 */
function detectPackageManager(targetDir: string): 'npm' | 'pnpm' | 'yarn' {
  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

/**
 * Check if Playwright scaffolding has already been done
 */
export function isPlaywrightScaffolded(targetDir: string): boolean {
  const playwrightConfig = path.join(targetDir, 'playwright.config.ts');
  const testsDir = path.join(targetDir, 'tests');

  return fs.existsSync(playwrightConfig) && fs.existsSync(testsDir);
}
