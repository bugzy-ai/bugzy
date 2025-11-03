---
description: >-
  Systematically explore application to discover UI elements, workflows, and
  behaviors
allowed-tools: 'Read, Write, MultiEdit, Task'
argument-hint: '--focus [area] --depth [shallow|deep] --system [system-name]'
---
# Explore Application Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.example`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.example` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Systematically explore the application using the test-runner agent to discover actual UI elements, workflows, and behaviors. Updates test plan and project documentation with findings.

## Arguments
Arguments: $ARGUMENTS

## Parse Arguments
Extract the following from arguments:
- **focus**: Specific area to explore (authentication, navigation, search, content, admin)
- **depth**: Exploration depth - shallow (quick discovery) or deep (comprehensive) - defaults to deep
- **system**: Which system to explore (optional for multi-system setups)

## Process

### Step 0: Understand Exploration Protocol

This task implements the exploration protocol defined in the exploration-instructions template.

**Purpose**: This task provides the infrastructure for systematic application exploration that is referenced by other tasks (generate-test-plan, generate-test-cases, verify-changes) when they need to explore features before proceeding.

**Depth Alignment**: The depth levels in this task align with the exploration template:
- **Shallow exploration (15-20 min)** implements the quick/moderate exploration from the template
- **Deep exploration (45-60 min)** implements comprehensive deep exploration from the template

The depth levels are extended for full application exploration compared to the focused feature exploration used in other tasks.

**Full Exploration Protocol Reference**:


## Exploratory Testing Protocol

Before creating or running formal tests, perform exploratory testing to validate requirements and understand actual system behavior. The depth of exploration should adapt to the clarity of requirements.

### Step {{STEP_NUMBER}}.1: Assess Requirement Clarity

Determine exploration depth based on requirement quality:

| Clarity | Indicators | Exploration Depth | Goal |
|---------|-----------|-------------------|------|
| **Clear** | Detailed acceptance criteria, screenshots/mockups, specific field names/URLs/roles, unambiguous behavior, consistent patterns | Quick (1-2 min) | Confirm feature exists, capture evidence |
| **Vague** | General direction clear but specifics missing, incomplete examples, assumed details, relative terms ("fix", "better") | Moderate (3-5 min) | Document current behavior, identify ambiguities, generate clarification questions |
| **Unclear** | Contradictory info, multiple interpretations, no examples/criteria, ambiguous scope ("the page"), critical details missing | Deep (5-10 min) | Systematically test scenarios, document patterns, identify all ambiguities, formulate comprehensive questions |

**Examples:**
- **Clear:** "Change 'Submit' button from blue (#007BFF) to green (#28A745) on /auth/login. Verify hover effect."
- **Vague:** "Fix the ordering in Employee details page. The rows are mixed up for Manager users."
- **Unclear:** "Improve the dashboard performance. Users say it's slow."

### Step {{STEP_NUMBER}}.2: Quick Exploration (1-2 min)

**When:** Requirements CLEAR

**Steps:**
1. Navigate to feature (use provided URL), verify loads without errors
2. Verify key elements exist (buttons, fields, sections mentioned)
3. Capture screenshot of initial state
4. Document:
   ```markdown
   **Quick Exploration (1 min)**
   Feature: [Name] | URL: [Path]
   Status: ✅ Accessible / ❌ Not found / ⚠️ Different
   Screenshot: [filename]
   Notes: [Immediate observations]
   ```
5. **Decision:** ✅ Matches → Test creation | ❌/⚠️ Doesn't match → Moderate Exploration

**Time Limit:** 1-2 minutes

### Step {{STEP_NUMBER}}.3: Moderate Exploration (3-5 min)

**When:** Requirements VAGUE or Quick Exploration revealed discrepancies

**Steps:**
1. Navigate using appropriate role(s), set up preconditions, ensure clean state
2. Test primary user flow, document steps and behavior, note unexpected behavior
3. Capture before/after screenshots, document field values/ordering/visibility
4. Compare to requirement: What matches? What differs? What's absent?
5. Identify specific ambiguities:
   ```markdown
   **Moderate Exploration (4 min)**

   **Explored:** Role: [Admin], Path: [Steps], Behavior: [What happened]

   **Current State:** [Specific observations with examples]
   - Example: "Admin view shows 21 fields: User ID, Employee Ref, Mobile Phone..."

   **Requirement Says:** [What requirement expected]

   **Discrepancies:** [Specific differences]
   - Example: "Manager missing 8 fields that Admin has"

   **Ambiguities:**
   1. [First ambiguity with concrete example]
   2. [Second if applicable]

   **Clarification Needed:** [Specific questions]
   ```
6. Assess severity using Clarification Protocol
7. **Decision:** 🟢 Minor → Proceed with assumptions | 🟡 Medium → Async clarification, proceed | 🔴 Critical → Stop, escalate

**Time Limit:** 3-5 minutes

### Step {{STEP_NUMBER}}.4: Deep Exploration (5-10 min)

**When:** Requirements UNCLEAR or critical ambiguities found

**Steps:**
1. **Define Exploration Matrix:** Identify dimensions (user roles, feature states, input variations, browsers)

2. **Systematic Testing:** Test each matrix cell methodically
   ```
   Example for "Employee Details Ordering":
   Matrix: User Roles × Feature Observations

   Test 1: Admin Role → Navigate, document fields (count, names, order), screenshot
   Test 2: Manager Role → Same employee, document fields, screenshot
   Test 3: Compare → Side-by-side table, identify missing/reordered fields
   ```

3. **Document Patterns:** Consistent behavior? Role-based differences? What varies vs constant?

4. **Comprehensive Report:**
   ```markdown
   **Deep Exploration (8 min)**

   **Matrix:** [Dimensions] | **Tests:** [X combinations]

   **Findings:**

   ### Test 1: Admin
   - Setup: [Preconditions] | Steps: [Actions]
   - Observations: Field count=21, Fields=[list], Ordering=[sequence]
   - Screenshot: [filename-admin.png]

   ### Test 2: Manager
   - Setup: [Preconditions] | Steps: [Actions]
   - Observations: Field count=13, Missing vs Admin=[8 fields], Ordering=[sequence]
   - Screenshot: [filename-manager.png]

   **Comparison Table:**
   | Field | Admin Pos | Manager Pos | Notes |
   |-------|-----------|-------------|-------|
   | User ID | 1 | 1 | Match |
   | Mobile | 6 | Not visible | Missing |

   **Patterns:**
   - Role-based field visibility
   - Consistent relative ordering for visible fields

   **Critical Ambiguities:**
   1. Field Visibility: Intentional Manager sees 8 fewer fields?
   2. Ordering Definition: (A) All roles see all fields same order, OR (B) Roles see permitted fields in same relative order?

   **Clarification Questions:** [Specific, concrete based on findings]
   ```

5. **Next Action:** Critical ambiguities → STOP, clarify | Patterns suggest answer → Validate assumption | Behavior clear → Test creation

**Time Limit:** 5-10 minutes

### Step {{STEP_NUMBER}}.5: Link Exploration to Clarification

**Flow:** Requirement Analysis → Exploration → Clarification

1. Requirement analysis detects vague language → Triggers exploration
2. Exploration documents current behavior → Identifies discrepancies
3. Clarification uses findings → Asks specific questions referencing observations

**Example:**
```
"Fix the ordering in Employee details"
  ↓ Ambiguity: "ordering" = sequence OR visibility?
  ↓ Moderate Exploration: Admin=21 fields, Manager=13 fields
  ↓ Question: "Is Manager supposed to see all 21 fields (bug) or only 13 with consistent sequence (correct)?"
```

### Step {{STEP_NUMBER}}.6: Document Exploration Results

**Template:**
```markdown
## Exploration Summary

**Date:** [YYYY-MM-DD] | **Explorer:** [Agent/User] | **Depth:** [Quick/Moderate/Deep] | **Duration:** [X min]

### Feature: [Name and description]

### Observations: [Key findings]

### Current Behavior: [What feature does today]

### Discrepancies: [Requirement vs observation differences]

### Assumptions Made: [If proceeding with assumptions]

### Artifacts: Screenshots: [list], Video: [if captured], Notes: [detailed]
```

**Memory Storage:** Feature behavior patterns, common ambiguity types, resolution approaches

### Step {{STEP_NUMBER}}.7: Integration with Test Creation

**Quick Exploration → Direct Test:**
- Feature verified → Create test matching requirement → Reference screenshot

**Moderate Exploration → Assumption-Based Test:**
- Document behavior → Create test on best interpretation → Mark assumptions → Plan updates after clarification

**Deep Exploration → Clarification-First:**
- Block test creation until clarification → Use exploration as basis for questions → Create test after answer → Reference both exploration and clarification

---

## Adaptive Exploration Decision Tree

```
Start: Requirement Received
    ↓
Are requirements clear with specifics?
    ├─ YES → Quick Exploration (1-2 min)
    │         ↓
    │      Does feature match description?
    │         ├─ YES → Proceed to Test Creation
    │         └─ NO → Escalate to Moderate Exploration
    │
    └─ NO → Is general direction clear but details missing?
          ├─ YES → Moderate Exploration (3-5 min)
          │         ↓
          │      Are ambiguities MEDIUM severity or lower?
          │         ├─ YES → Document assumptions, proceed with test creation
          │         └─ NO → Escalate to Deep Exploration or Clarification
          │
          └─ NO → Deep Exploration (5-10 min)
                    ↓
                 Document comprehensive findings
                    ↓
                 Assess ambiguity severity
                    ↓
                 Seek clarification for CRITICAL/HIGH
```

---

## Remember:

🔍 **Explore before assuming** | 📊 **Concrete observations > abstract interpretation** | ⏱️ **Adaptive depth: time ∝ uncertainty** | 🎯 **Exploration findings → specific clarifications** | 📝 **Always document** | 🔗 **Link exploration → ambiguity → clarification**


**Note**: This task extends the protocol for comprehensive application-wide exploration, while other tasks use abbreviated versions for targeted feature exploration.

### Step 1: Load Environment and Context

#### 1.1 Check Environment Variables
Read `.env.example` file to understand what variables are required:
- TEST_BASE_URL or TEST_MOBILE_BASE_URL (base URL variable names)
- [SYSTEM_NAME]_URL (if multi-system setup)
- Authentication credential variable names for the selected system
- Any test data variable names

Note: The actual values will be read from the user's `.env` file at test execution time.
Verify `.env.example` exists to understand variable structure. If it doesn't exist, notify user to create it based on test plan.

#### 1.2 Read Current Test Plan
Read `test-plan.md` to:
- Identify sections marked with [TO BE EXPLORED]
- Find features requiring discovery
- Understand testing scope and priorities

#### 1.3 Read Project Context
Read `.bugzy/runtime/project-context.md` for:
- System architecture understanding
- Testing environment details
- QA workflow requirements

### Step 2: Prepare Exploration Strategy

Based on the arguments and context, prepare exploration instructions.

#### 2.1 Focus Area Strategies

**If focus is "authentication":**
```
1. Navigate to the application homepage
2. Locate and document all authentication entry points:
   - Login button/link location and selector
   - Registration option and flow
   - Social login options (Facebook, Google, etc.)
3. Test login flow:
   - Document form fields and validation
   - Test error states with invalid credentials
   - Verify successful login indicators
4. Test logout functionality:
   - Find logout option
   - Verify session termination
   - Check redirect behavior
5. Explore password recovery:
   - Locate forgot password link
   - Document recovery flow
   - Note email/SMS options
6. Check role-based access:
   - Identify user role indicators
   - Document permission differences
   - Test admin/moderator access if available
7. Test session persistence:
   - Check remember me functionality
   - Test timeout behavior
   - Verify multi-tab session handling
```

**If focus is "navigation":**
```
1. Document main navigation structure:
   - Primary menu items and hierarchy
   - Mobile menu behavior
   - Footer navigation links
2. Map URL patterns:
   - Category URL structure
   - Parameter patterns
   - Deep linking support
3. Test breadcrumb navigation:
   - Availability on different pages
   - Clickability and accuracy
   - Mobile display
4. Explore category system:
   - Main categories and subcategories
   - Navigation between levels
   - Content organization
5. Document special sections:
   - User profiles
   - Admin areas
   - Help/Support sections
6. Test browser navigation:
   - Back/forward button behavior
   - History management
   - State preservation
```

**If focus is "search":**
```
1. Locate search interfaces:
   - Main search bar
   - Advanced search options
   - Category-specific search
2. Document search features:
   - Autocomplete/suggestions
   - Search filters
   - Sort options
3. Test search functionality:
   - Special character handling
   - Empty/invalid queries
4. Analyze search results:
   - Result format and layout
   - Pagination
   - No results handling
5. Check search performance:
   - Response times
   - Result relevance
   - Load more/infinite scroll
```

**If no focus specified:**
Use comprehensive exploration covering all major areas.

#### 2.2 Depth Configuration

**Implementation Note**: These depths implement the exploration protocol defined in exploration-instructions.ts, extended for full application exploration.

**Shallow exploration (--depth shallow):**
- Quick discovery pass (15-20 minutes)
- Focus on main features only
- Basic screenshot capture
- High-level findings
- *Aligns with Quick/Moderate exploration from template*

**Deep exploration (--depth deep or default):**
- Comprehensive exploration (45-60 minutes)
- Test edge cases and variations
- Extensive screenshot documentation
- Detailed technical findings
- Performance observations
- Accessibility notes
- *Aligns with Deep exploration from template*

### Step 3: Execute Exploration

#### 3.1 Create Exploration Test Case
Generate a temporary exploration test case file at `./test-cases/EXPLORATION-TEMP.md`:

```markdown
---
id: EXPLORATION-TEMP
title: Application Exploration - [Focus Area or Comprehensive]
type: exploratory
priority: high
---

## Preconditions
- Browser with cleared cookies and cache
- Access to [system] environment
- Credentials configured per .env.example template

## Test Steps
[Generated exploration steps based on strategy]

## Expected Results
Document all findings including:
- UI element locations and selectors
- Navigation patterns and URLs
- Feature behaviors and workflows
- Performance observations
- Error states and edge cases
- Screenshots of all key areas
```

#### 3.2 Launch Test Runner Agent
Invoke the test-runner agent with special exploration instructions:

```
Execute the exploration test case at ./test-cases/EXPLORATION-TEMP.md with focus on discovery and documentation.

Special instructions for exploration mode:
1. Take screenshots of EVERY significant UI element and page
2. Document all clickable elements with their selectors
3. Note all URL patterns and parameters
4. Test variations and edge cases where possible
5. Document load times and performance observations
6. Create detailed findings report with structured data
7. Organize screenshots by functional area
8. Note any console errors or warnings
9. Document which features are accessible vs restricted

Generate a comprehensive exploration report that can be used to update project documentation.
```

### Step 4: Process Exploration Results

#### 4.1 Read Test Runner Output
Read the generated test run files from `./test-runs/[timestamp]/EXPLORATION-TEMP/`:
- `findings.md` - Main findings document
- `test-log.md` - Detailed step execution
- `screenshots/` - Visual documentation
- `summary.json` - Execution summary

#### 4.2 Parse and Structure Findings
Extract and organize:
- Discovered features and capabilities
- UI element selectors and patterns
- Navigation structure and URLs
- Authentication flow details
- Performance metrics
- Technical observations
- Areas requiring further investigation

### Step 5: Update Project Artifacts

#### 5.1 Update Test Plan
Read and update `test-plan.md`:
- Replace [TO BE EXPLORED] markers with concrete findings
- Add newly discovered features to test items
- Update navigation patterns and URL structures
- Document actual authentication methods
- Update environment variables if new ones discovered
- Refine pass/fail criteria based on actual behavior

#### 5.2 Create Exploration Report
Create `./exploration-reports/[timestamp]-[focus]-exploration.md`

### Step 6: Cleanup

#### 6.1 Remove Temporary Files
Delete the temporary exploration test case:
```bash
rm ./test-cases/EXPLORATION-TEMP.md
```

### Step 7: Generate Summary Report
Create a concise summary for the user

## Error Handling

### Environment Issues
- If `.env.example` missing: Warn user and suggest creating it from test plan
- If credentials invalid (at runtime): Document in report and continue with public areas
- If system unreachable: Retry with exponential backoff, report if persistent

### Exploration Failures
- If test-runner fails: Capture partial results and report
- If specific area inaccessible: Note in findings and continue
- If browser crashes: Attempt recovery and resume
- If test-runner stops, but does not create files, inspect what it did and if it was not enough remove the test-run and start the test-runner agent again. If it has enough info, continue with what you have.

### Data Issues
- If dynamic content prevents exploration: Note and try alternative approaches
- If rate limited: Implement delays and retry

## Integration with Other Commands

### Feeds into /generate-test-cases
- Provides actual UI elements for test steps
- Documents real workflows for test scenarios
- Identifies edge cases to test

### Updates from /process-event
- New exploration findings can be processed as events
- Discovered bugs trigger issue creation
- Feature discoveries update test coverage

### Enhances /run-tests
- Tests use discovered selectors
- Validation based on actual behavior
- More reliable test execution
