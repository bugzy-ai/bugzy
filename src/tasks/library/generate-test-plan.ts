/**
 * Generate Test Plan Task
 * Generate a comprehensive test plan from product description
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { EXPLORATION_INSTRUCTIONS } from '../templates/exploration-instructions';
import { CLARIFICATION_INSTRUCTIONS } from '../templates/clarification-instructions';
import { KNOWLEDGE_BASE_READ_INSTRUCTIONS, KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS } from '../templates/knowledge-base.js';

export const generateTestPlanTask: TaskTemplate = {
  slug: TASK_SLUGS.GENERATE_TEST_PLAN,
  name: 'Generate Test Plan',
  description: 'Generate a comprehensive test plan from product description',

  frontmatter: {
    description: 'Generate a comprehensive test plan from product description',
    'argument-hint': '<product-description>',
  },

  baseContent: `# Generate Test Plan Command

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.testdata\`** for non-secret test data (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.testdata\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

Generate a comprehensive test plan from product description following the Brain Module specifications.

## Arguments
Product description: \$ARGUMENTS

${KNOWLEDGE_BASE_READ_INSTRUCTIONS}

## Process

### Step 1: Load project context
Read \`.bugzy/runtime/project-context.md\` to understand:
- Project overview and key platform features
- SDLC methodology and sprint duration
- Testing environment and goals
- Technical stack and constraints
- QA workflow and processes

### Step 1.5: Process the product description
Use the product description provided directly in the arguments, enriched with project context understanding.

### Step 1.6: Initialize environment variables tracking
Create a list to track all TEST_ prefixed environment variables discovered throughout the process.

{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}

### Step 1.7: Explore Product (If Needed)

If product description is vague or incomplete, perform adaptive exploration to understand actual product features and behavior.

${EXPLORATION_INSTRUCTIONS.replace(/{{STEP_NUMBER}}/g, '1.7')}

### Step 1.8: Clarify Ambiguities

If exploration or product description reveals ambiguous requirements, use the clarification protocol before generating the test plan.

${CLARIFICATION_INSTRUCTIONS.replace(/{{STEP_NUMBER}}/g, '1.8')}

**Important Notes:**
- **CRITICAL/HIGH ambiguities:** STOP test plan generation and seek clarification
  - Examples: Undefined core features, unclear product scope, contradictory requirements
- **MEDIUM ambiguities:** Document assumptions in test plan with [ASSUMED: reason] and seek async clarification
  - Examples: Missing field lists, unclear validation rules, vague user roles
- **LOW ambiguities:** Mark with [TO BE EXPLORED: detail] in test plan for future investigation
  - Examples: Optional features, cosmetic details, non-critical edge cases

### Step 3: Prepare the test plan generation context

**After ensuring requirements are clear through exploration and clarification:**

Based on the gathered information:
- **goal**: Extract the main purpose and objectives from all available documentation
- **knowledge**: Combine product description with discovered documentation insights
- **testPlan**: Use the standard test plan template structure, enriched with documentation findings
- **gaps**: Identify areas lacking documentation that will need exploration

### Step 4: Generate the test plan using the prompt template

You are an expert QA Test Plan Writer with expertise in both manual and automated testing strategies. Using the gathered information and context from the product description provided, you will now produce a comprehensive test plan in Markdown format that includes an automation strategy.

Writing Instructions:
- **Use Product Terminology:** Incorporate exact terms and labels from the product description for features and UI elements (to ensure the test plan uses official naming).
- **Testing Scope:** The plan covers both automated E2E testing via Playwright and exploratory manual testing. Focus on what a user can do and see in a browser.
- **Test Data - IMPORTANT:**
  - DO NOT include test data values in the test plan body
  - Test data goes ONLY to the \`.env.testdata\` file
  - In the test plan, reference \`.env.testdata\` for test data requirements
  - Define test data as environment variables prefixed with TEST_ (e.g., TEST_BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD)
  - DO NOT GENERATE VALUES FOR THE ENV VARS, ONLY THE KEYS
  - Track all TEST_ variables for extraction to .env.testdata in Step 7
- **DO NOT INCLUDE TEST SCENARIOS**
- **Incorporate All Relevant Info:** If the product description mentions specific requirements, constraints, or acceptance criteria (such as field validations, role-based access rules, important parameters), make sure these are reflected in the test plan. Do not add anything not supported by the given information.
- **Test Automation Strategy Section - REQUIRED:** Include a comprehensive "Test Automation Strategy" section with the following subsections:

  **## Test Automation Strategy**

  ### Automated Test Coverage
  - Identify critical user paths to automate (login, checkout, core features)
  - Define regression test scenarios for automation
  - Specify API endpoints that need automated testing
  - List smoke test scenarios for CI/CD pipeline

  ### Exploratory Testing Areas
  - New features not yet automated
  - Complex edge cases requiring human judgment
  - Visual/UX validation requiring subjective assessment
  - Scenarios that are not cost-effective to automate

  ### Test Data Management
  - Environment variables strategy (which vars go in .env.example vs .env)
  - Dynamic test data generation approach (use data generators)
  - API-based test data setup (10-20x faster than UI)
  - Test data isolation and cleanup strategy

  ### Automation Approach
  - **Framework:** Playwright + TypeScript (already scaffolded)
  - **Pattern:** Page Object Model for all pages
  - **Selectors:** Prioritize role-based selectors (getByRole, getByLabel, getByText)
  - **Components:** Reusable component objects for common UI elements
  - **Fixtures:** Custom fixtures for authenticated sessions and common setup
  - **API for Speed:** Use Playwright's request context to create test data via API
  - **Best Practices:** Reference \`.bugzy/runtime/testing-best-practices.md\` for patterns

  ### Test Organization
  - Automated tests location: \`./tests/specs/[feature]/\`
  - Page Objects location: \`./tests/pages/\`
  - Manual test cases location: \`./test-cases/\` (human-readable documentation)
  - Test case naming: TC-XXX-feature-description.md
  - Automated test naming: feature.spec.ts

  ### Automation Decision Criteria
  Define which scenarios warrant automation:
  - ✅ Automate: Frequent execution, critical paths, regression tests, CI/CD integration
  - ❌ Keep Manual: Rare edge cases, exploratory tests, visual validation, one-time checks

### Step 5: Create the test plan file

Read the test plan template from \`.bugzy/runtime/templates/test-plan-template.md\` and use it as the base structure. Fill in the placeholders with information extracted from BOTH the product description AND documentation research:

1. Read the template file from \`.bugzy/runtime/templates/test-plan-template.md\`
2. Replace placeholders like:
   - \`[ProjectName]\` with the actual project name from the product description
   - \`[Date]\` with the current date
   - Feature sections with actual features identified from all documentation sources
   - Test data requirements based on the product's needs and API documentation
   - Risks based on the complexity, known issues, and technical constraints
3. Add any product-specific sections that may be needed based on discovered documentation
4. **Mark ambiguities based on severity:**
   - CRITICAL/HIGH: Should be clarified before plan creation (see Step 1.8)
   - MEDIUM: Mark with [ASSUMED: reason] and note assumption
   - LOW: Mark with [TO BE EXPLORED: detail] for future investigation
5. Include references to source documentation for traceability

### Step 6: Save the test plan

Save the generated test plan to a file named \`test-plan.md\` in the project root with appropriate frontmatter:

\`\`\`yaml
---
version: 1.0.0
lifecycle_phase: initial
created_at: [current date]
updated_at: [current date]
last_exploration: null
total_discoveries: 0
status: draft
author: claude
tags: [functional, security, performance]
---
\`\`\`

### Step 7: Extract and save environment variables

**CRITICAL**: Test data values must ONLY go to .env.testdata, NOT in the test plan document.

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
   - Add instruction: "Fill in actual values in .env.testdata before running tests"

${KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS}

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

### Step 8: Final summary

Provide a summary of:
- Test plan created successfully at \`test-plan.md\`
- Environment variables extracted to \`.env.testdata\`
- Number of TEST_ variables discovered
- Instructions for the user to fill in actual values in .env.testdata before running tests`,

  optionalSubagents: [
    {
      role: 'documentation-researcher',
      contentBlock: `### Step 2: Gather comprehensive project documentation

{{INVOKE_DOCUMENTATION_RESEARCHER}} to explore and gather all available project information and other documentation sources. This ensures the test plan is based on complete and current information.

\`\`\`
Explore all available project documentation related to: \$ARGUMENTS

Specifically gather:
- Product specifications and requirements
- User stories and acceptance criteria
- Technical architecture documentation
- API documentation and endpoints
- User roles and permissions
- Business rules and validations
- UI/UX specifications
- Known limitations or constraints
- Existing test documentation
- Bug reports or known issues
\`\`\`

The agent will:
1. Check its memory for previously discovered documentation
2. Explore workspace for relevant pages and databases
3. Build a comprehensive understanding of the product
4. Return synthesized information about all discovered documentation`
    },
    {
      role: 'team-communicator',
      contentBlock: `### Step 7.5: Team Communication

{{INVOKE_TEAM_COMMUNICATOR}} to notify the product team about the new test plan:

\`\`\`
1. Post an update about the test plan creation
2. Provide a brief summary of coverage areas and key features
3. Mention any areas that need exploration or clarification
4. Ask for team review and feedback on the test plan
5. Include a link or reference to the test-plan.md file
6. Use appropriate channel and threading for the update
\`\`\`

The team communication should include:
- **Test plan scope**: Brief overview of what will be tested
- **Coverage highlights**: Key features and user flows included
- **Areas needing clarification**: Any uncertainties discovered during documentation research
- **Review request**: Ask team to review and provide feedback
- **Next steps**: Mention plan to generate test cases after review

**Update team communicator memory:**
- Record this communication in the team-communicator memory
- Note this as a test plan creation communication
- Track team response to this type of update`
    }
  ],
  requiredSubagents: ['test-runner']
};
