/**
 * Generate Test Plan Task (Composed)
 * Generate a comprehensive test plan from product description
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const generateTestPlanTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.GENERATE_TEST_PLAN,
  name: 'Generate Test Plan',
  description: 'Generate a concise feature checklist test plan from product description',

  frontmatter: {
    description: 'Generate a concise feature checklist test plan (~50-100 lines)',
    'argument-hint': '<product-description>',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Generate Test Plan Overview',
      content: `Generate a comprehensive test plan from product description following the Brain Module specifications.`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Product description: $ARGUMENTS`,
    },
    // Step 5: Process Description (inline)
    {
      inline: true,
      title: 'Process the Product Description',
      content: `Use the product description provided directly in the arguments, enriched with project context understanding.`,
    },
    // Step 7: Initialize Env Tracking (inline)
    {
      inline: true,
      title: 'Initialize Environment Variables Tracking',
      content: `Create a list to track all TEST_ prefixed environment variables discovered throughout the process.`,
    },
    // Step 8: Documentation Researcher (conditional library step)
    {
      stepId: 'gather-documentation',
      conditionalOnSubagent: 'documentation-researcher',
    },
    // Step 9: Exploration Protocol (from library)
    'exploration-protocol',
    // Step 10: Clarification Protocol (from library)
    'clarification-protocol',
    // Step 11: Prepare Context (inline)
    {
      inline: true,
      title: 'Prepare Test Plan Generation Context',
      content: `**After ensuring requirements are clear through exploration and clarification:**

Based on the gathered information:
- **goal**: Extract the main purpose and objectives from all available documentation
- **knowledge**: Combine product description with discovered documentation insights
- **testPlan**: Use the standard test plan template structure, enriched with documentation findings
- **gaps**: Identify areas lacking documentation that will need exploration`,
    },
    // Step 12: Generate Test Plan (inline - more detailed than library step)
    {
      inline: true,
      title: 'Generate Test Plan Using Simplified Format',
      content: `You are an expert QA Test Plan Writer. Generate a **concise** test plan (~50-100 lines) that serves as a feature checklist for test case generation.

**CRITICAL - Keep it Simple:**
- The test plan is a **feature checklist**, NOT a comprehensive document
- Detailed UI elements and exploration findings go to \`./exploration-reports/\`
- Technical patterns and architecture go to \`.bugzy/runtime/knowledge-base.md\`
- Process documentation stays in \`.bugzy/runtime/project-context.md\`

**Writing Instructions:**
- **Use Product Terminology:** Use exact feature names from the product description
- **Feature Checklist Format:** Each feature is a checkbox item with brief description
- **Group by Feature Area:** Organize features into logical sections
- **NO detailed UI elements** - those belong in exploration reports
- **NO test scenarios** - those are generated in test cases
- **NO process documentation** - keep only what's needed for test generation

**Test Data Handling:**
- Test data goes ONLY to \`.env.testdata\` file
- In test plan, reference environment variable NAMES only (e.g., TEST_BASE_URL)
- DO NOT generate values for env vars, only keys
- Track all TEST_ variables for extraction to .env.testdata in the next step`,
    },
    // Step 13: Create Test Plan File (inline)
    {
      inline: true,
      title: 'Create Test Plan File',
      content: `Read the simplified template from \`.bugzy/runtime/templates/test-plan-template.md\` and fill it in:

1. Read the template file
2. Replace placeholders:
   - \`[PROJECT_NAME]\` with the actual project name
   - \`[DATE]\` with the current date
   - Feature sections with actual features grouped by area
3. Each feature is a **checkbox item** with brief description
4. **Mark ambiguities:**
   - MEDIUM: Mark with [ASSUMED: reason]
   - LOW: Mark with [TO BE EXPLORED: detail]
5. Keep total document under 100 lines`,
    },
    // Step 14: Save Test Plan (inline)
    {
      inline: true,
      title: 'Save Test Plan',
      content: `Save to \`test-plan.md\` in project root. The template already includes frontmatter - just fill in the dates.`,
    },
    // Step 15: Extract Env Variables (inline - more detailed than library step)
    {
      inline: true,
      title: 'Extract and Save Environment Variables',
      content: `**CRITICAL**: Test data values must ONLY go to .env.testdata, NOT in the test plan document.

After saving the test plan:

1. **Parse the test plan** to find all TEST_ prefixed environment variables mentioned:
   - Look in the Testing Environment section
   - Search for any TEST_ variables referenced
   - Extract variables from configuration or setup sections
   - Common patterns include: TEST_BASE_URL, TEST_USER_*, TEST_API_*, TEST_ADMIN_*, etc.

2. **Create .env.testdata file** with all discovered variables:
   \`\`\`bash
   # Application Configuration
   TEST_BASE_URL=

   # Test User Credentials
   TEST_USER_EMAIL=
   TEST_USER_PASSWORD=
   TEST_ADMIN_EMAIL=
   TEST_ADMIN_PASSWORD=

   # API Configuration
   TEST_API_KEY=
   TEST_API_SECRET=

   # Other Test Data
   TEST_DB_NAME=
   TEST_TIMEOUT=
   \`\`\`

3. **Add helpful comments** for each variable group to guide users in filling values

4. **Save the file** as \`.env.testdata\` in the project root

5. **Verify test plan references .env.testdata**:
   - Ensure test plan DOES NOT contain test data values
   - Ensure test plan references \`.env.testdata\` for test data requirements
   - Add instruction: "Fill in actual values in .env.testdata before running tests"`,
    },
    // Step 16: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 17: Team Communication (conditional inline)
    {
      inline: true,
      title: 'Team Communication',
      content: `{{INVOKE_TEAM_COMMUNICATOR}} to share the test plan with the team for review, highlighting coverage areas and any unresolved clarifications.`,
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 18: Final Summary (inline)
    {
      inline: true,
      title: 'Final Summary',
      content: `Provide a summary of:
- Test plan created successfully at \`test-plan.md\`
- Environment variables extracted to \`.env.testdata\`
- Number of TEST_ variables discovered
- Instructions for the user to fill in actual values in .env.testdata before running tests`,
    },
  ],

  requiredSubagents: ['browser-automation'],
  optionalSubagents: ['documentation-researcher', 'team-communicator'],
  dependentTasks: [],
};
