/**
 * Project Structure Generator
 * Create .bugzy/ folder structure and scaffold files
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Create project folder structure
 * Creates .bugzy/ and .claude/ directories with initial files
 */
export async function createProjectStructure(): Promise<void> {
  const cwd = process.cwd();

  // Create .bugzy/ structure
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

  // Create .claude/ structure
  const claudeDirs = [
    '.claude',
    '.claude/commands',
    '.claude/agents'
  ];

  for (const dir of claudeDirs) {
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
}

/**
 * Generate CLAUDE.md in project root from template
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
