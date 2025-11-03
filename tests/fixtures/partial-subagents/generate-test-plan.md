---
allowed-tools: Read, Write, MultiEdit
argument-hint: <product-description>
description: Generate a comprehensive test plan from product description
---

# Generate Test Plan Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.example`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.example` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Generate a comprehensive test plan from product description following the Brain Module specifications.

## Arguments
Product description: $ARGUMENTS

## Process

### Step 1: Load project context
Read `.bugzy/runtime/project-context.md` to understand:
- Project overview and key platform features
- SDLC methodology and sprint duration
- Testing environment and goals
- Technical stack and constraints
- QA workflow and processes

### Step 1.5: Process the product description
Use the product description provided directly in the arguments, enriched with project context understanding.

### Step 1.6: Initialize environment variables tracking
Create a list to track all TEST_ prefixed environment variables discovered throughout the process.

### Step 2: Prepare the test plan generation context

Based on the product description:
- **goal**: Extract the main purpose and objectives from the product description
- **knowledge**: Use product description as the primary source
- **testPlan**: Use the standard test plan template structure
- **gaps**: Identify areas that will need exploration

### Step 3: Generate the test plan using the prompt template

You are an expert QA Test Plan Writer. Using the gathered information and context from the product description provided, you will now produce a comprehensive test plan in Markdown format. The plan is strictly for exploratory and regression testing via the web UI, focusing on what a user can do and see in a browser.

Writing Instructions:
- **Use Product Terminology:** Incorporate exact terms and labels from the product description for features and UI elements (to ensure the test plan uses official naming).
- **Scope – UI Only:** Include only test scenarios that involve interacting with the application through the browser (clicking buttons, filling forms, navigating pages, etc.). Do not include any tests or details about backend processes, databases, or APIs.
- **Test Data - IMPORTANT:**
  - DO NOT include test data values in the test plan body
  - Test data goes ONLY to the `.env.example` file
  - In the test plan, reference `.env.example` for test data requirements
  - Define test data as environment variables prefixed with TEST_ (e.g., TEST_BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD)
  - DO NOT GENERATE VALUES FOR THE ENV VARS, ONLY THE KEYS
  - Track all TEST_ variables for extraction to .env.example in Step 6
- **DO NOT INCLUDE TEST SCENARIOS**
- **Incorporate All Relevant Info:** If the product description mentions specific requirements, constraints, or acceptance criteria (such as field validations, role-based access rules, important parameters), make sure these are reflected in the test plan. Do not add anything not supported by the given information.

### Step 4: Create the test plan file

Read the test plan template from `.bugzy/runtime/templates/test-plan-template.md` and use it as the base structure. Fill in the placeholders with information extracted from the product description:

1. Read the template file from `.bugzy/runtime/templates/test-plan-template.md`
2. Replace placeholders like:
   - `[ProjectName]` with the actual project name from the product description
   - `[Date]` with the current date
   - Feature sections with actual features identified from the product description
   - Test data requirements based on the product's needs
   - Risks based on the complexity and technical constraints
3. Add any product-specific sections that may be needed
4. Mark areas that need exploration with `[TO BE EXPLORED]`

### Step 5: Save the test plan

Save the generated test plan to a file named `test-plan.md` in the project root with appropriate frontmatter:

```yaml
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
```

### Step 6: Extract and save environment variables

**CRITICAL**: Test data values must ONLY go to .env.example, NOT in the test plan document.

After saving the test plan:

1. **Parse the test plan** to find all TEST_ prefixed environment variables mentioned:
   - Look in the Testing Environment section
   - Search for any TEST_ variables referenced
   - Extract variables from configuration or setup sections
   - Common patterns include: TEST_BASE_URL, TEST_USER_*, TEST_API_*, TEST_ADMIN_*, etc.

2. **Create .env.example file** with all discovered variables:
   ```bash
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
   ```

3. **Add helpful comments** for each variable group to guide users in filling values

4. **Save the file** as `.env.example` in the project root

5. **Verify test plan references .env.example**:
   - Ensure test plan DOES NOT contain test data values
   - Ensure test plan references `.env.example` for test data requirements
   - Add instruction: "Copy .env.example to .env and fill in actual values before running tests"

### Step 7: Team Communication

Use the team-communicator agent to notify the product team about the new test plan:

```
Use the team-communicator agent to:
1. Post an update about the test plan creation
2. Provide a brief summary of coverage areas and key features
3. Mention any areas that need exploration or clarification
4. Ask for team review and feedback on the test plan
5. Include a link or reference to the test-plan.md file
6. Use appropriate channel and threading for the update
```

The team communication should include:
- **Test plan scope**: Brief overview of what will be tested
- **Coverage highlights**: Key features and user flows included
- **Areas needing clarification**: Any uncertainties discovered during planning
- **Review request**: Ask team to review and provide feedback
- **Next steps**: Mention plan to generate test cases after review

**Update team communicator memory:**
- Record this communication in the team-communicator memory
- Note this as a test plan creation communication
- Track team response to this type of update

### Step 8: Final summary

Provide a summary of:
- Test plan created successfully at `test-plan.md`
- Environment variables extracted to `.env.example`
- Number of TEST_ variables discovered
- Instructions for the user to create their .env file from the template
- Team notification sent about test plan creation