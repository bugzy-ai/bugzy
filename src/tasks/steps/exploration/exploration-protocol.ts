import type { TaskStep } from '../types';

/**
 * Exploration Protocol - Consolidated step
 * Provides adaptive exploratory testing instructions based on requirement clarity.
 * Used to validate requirements and discover actual behavior before formal testing.
 */
export const explorationProtocolStep: TaskStep = {
  id: 'exploration-protocol',
  title: 'Exploration Protocol',
  category: 'exploration',
  content: `## Exploratory Testing Protocol

Before creating or running formal tests, perform exploratory testing to validate requirements and understand actual system behavior. The depth of exploration should adapt to the clarity of requirements.

### Assess Requirement Clarity

Determine exploration depth based on requirement quality:

| Clarity | Indicators | Exploration Depth | Goal |
|---------|-----------|-------------------|------|
| **Clear** | Detailed acceptance criteria, screenshots/mockups, specific field names/URLs/roles, unambiguous behavior, consistent patterns | Quick (1-2 min) | Confirm feature exists, capture evidence |
| **Vague** | General direction clear but specifics missing, incomplete examples, assumed details, relative terms ("fix", "better") | Moderate (3-5 min) | Document current behavior, identify ambiguities, generate clarification questions |
| **Unclear** | Contradictory info, multiple interpretations, no examples/criteria, ambiguous scope ("the page"), critical details missing | Deep (5-10 min) | Systematically test scenarios, document patterns, identify all ambiguities, formulate comprehensive questions |

**Examples:**
- **Clear:** "Change 'Submit' button from blue (#007BFF) to green (#28A745) on /auth/login. Verify hover effect."
- **Vague:** "Fix the sorting in todo list page. The items are mixed up for premium users."
- **Unclear:** "Improve the dashboard performance. Users say it's slow."

### Maturity Adjustment

If the Clarification Protocol determined project maturity, adjust exploration depth:

- **New project**: Default one level deeper than requirement clarity suggests (Clear → Moderate, Vague → Deep)
- **Growing project**: Use requirement clarity as-is (standard protocol)
- **Mature project**: Trust knowledge base — can stay at suggested depth or go one level shallower if KB covers the feature

**Always verify features exist before testing them.** If exploration reveals that a referenced page or feature does not exist in the application, this is CRITICAL severity — escalate via the Clarification Protocol regardless of maturity level. Do NOT silently adapt or work around the missing feature.

### Quick Exploration (1-2 min)

**When:** Requirements CLEAR

**Steps:**
1. Navigate to feature (use provided URL), verify loads without errors
2. Verify key elements exist (buttons, fields, sections mentioned)
3. Capture screenshot of initial state
4. Document:
   \`\`\`markdown
   **Quick Exploration (1 min)**
   Feature: [Name] | URL: [Path]
   Status: ✅ Accessible / ❌ Not found / ⚠️ Different
   Screenshot: [filename]
   Notes: [Immediate observations]
   \`\`\`
5. **Decision:** ✅ Matches → Test creation | ❌/⚠️ Doesn't match → Moderate Exploration

**Time Limit:** 1-2 minutes

### Moderate Exploration (3-5 min)

**When:** Requirements VAGUE or Quick Exploration revealed discrepancies

**Steps:**
1. Navigate using appropriate role(s), set up preconditions, ensure clean state
2. Test primary user flow, document steps and behavior, note unexpected behavior
3. Capture before/after screenshots, document field values/ordering/visibility
4. Compare to requirement: What matches? What differs? What's absent?
5. Identify specific ambiguities:
   \`\`\`markdown
   **Moderate Exploration (4 min)**

   **Explored:** Role: [Admin], Path: [Steps], Behavior: [What happened]

   **Current State:** [Specific observations with examples]
   - Example: "Admin view shows 8 sort options: By Title, By Due Date, By Priority..."

   **Requirement Says:** [What requirement expected]

   **Discrepancies:** [Specific differences]
   - Example: "Premium users see 5 fewer sorting options than admins"

   **Ambiguities:**
   1. [First ambiguity with concrete example]
   2. [Second if applicable]

   **Clarification Needed:** [Specific questions]
   \`\`\`
6. Assess severity using Clarification Protocol
7. **Decision:** 🟢 Minor → Proceed with assumptions | 🟡 Medium → Async clarification, proceed | 🔴 Critical → Stop, escalate

**Time Limit:** 3-5 minutes

### Deep Exploration (5-10 min)

**When:** Requirements UNCLEAR or critical ambiguities found

**Steps:**
1. **Define Exploration Matrix:** Identify dimensions (user roles, feature states, input variations, browsers)

2. **Systematic Testing:** Test each matrix cell methodically
   \`\`\`
   Example for "Todo List Sorting":
   Matrix: User Roles × Feature Observations

   Test 1: Admin Role → Navigate, document sort options (count, names, order), screenshot
   Test 2: Basic User Role → Same todo list, document options, screenshot
   Test 3: Compare → Side-by-side table, identify missing/reordered options
   \`\`\`

3. **Document Patterns:** Consistent behavior? Role-based differences? What varies vs constant?

4. **Comprehensive Report:**
   \`\`\`markdown
   **Deep Exploration (8 min)**

   **Matrix:** [Dimensions] | **Tests:** [X combinations]

   **Findings:**

   ### Test 1: Admin
   - Setup: [Preconditions] | Steps: [Actions]
   - Observations: Sort options=8, Options=[list], Ordering=[sequence]
   - Screenshot: [filename-admin.png]

   ### Test 2: Basic User
   - Setup: [Preconditions] | Steps: [Actions]
   - Observations: Sort options=3, Missing vs Admin=[5 options], Ordering=[sequence]
   - Screenshot: [filename-user.png]

   **Comparison Table:**
   | Sort Option | Admin Pos | User Pos | Notes |
   |-------------|-----------|----------|-------|
   | By Title | 1 | 1 | Match |
   | By Priority | 3 | Not visible | Missing |

   **Patterns:**
   - Role-based feature visibility
   - Consistent relative ordering for visible fields

   **Critical Ambiguities:**
   1. Option Visibility: Intentional basic users see 5 fewer sort options?
   2. Sort Definition: (A) All roles see all options in same order, OR (B) Roles see permitted options in same relative order?

   **Clarification Questions:** [Specific, concrete based on findings]
   \`\`\`

5. **Next Action:** Critical ambiguities → STOP, clarify | Patterns suggest answer → Validate assumption | Behavior clear → Test creation

**Time Limit:** 5-10 minutes

### Link Exploration to Clarification

**Flow:** Requirement Analysis → Exploration → Clarification

1. Requirement analysis detects vague language → Triggers exploration
2. Exploration documents current behavior → Identifies discrepancies
3. Clarification uses findings → Asks specific questions referencing observations

**Example:**
\`\`\`
"Fix the sorting in todo list"
  ↓ Ambiguity: "sorting" = by date, priority, or completion status?
  ↓ Moderate Exploration: Admin=8 sort options, User=3 sort options
  ↓ Question: "Should basic users see all 8 sort options (bug) or only 3 with consistent sequence (correct)?"
\`\`\`

### Document Exploration Results

**Template:**
\`\`\`markdown
## Exploration Summary

**Date:** [YYYY-MM-DD] | **Explorer:** [Agent/User] | **Depth:** [Quick/Moderate/Deep] | **Duration:** [X min]

### Feature: [Name and description]

### Observations: [Key findings]

### Current Behavior: [What feature does today]

### Discrepancies: [Requirement vs observation differences]

### Assumptions Made: [If proceeding with assumptions]

### Artifacts: Screenshots: [list], Video: [if captured], Notes: [detailed]
\`\`\`

**Memory Storage:** Feature behavior patterns, common ambiguity types, resolution approaches

### Integration with Test Creation

**Quick Exploration → Direct Test:**
- Feature verified → Create test matching requirement → Reference screenshot

**Moderate Exploration → Assumption-Based Test:**
- Document behavior → Create test on best interpretation → Mark assumptions → Plan updates after clarification

**Deep Exploration → Clarification-First:**
- Block test creation until clarification → Use exploration as basis for questions → Create test after answer → Reference both exploration and clarification

---

## Adaptive Exploration Decision Tree

\`\`\`
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
\`\`\`

---

## Remember

- **Explore before assuming** - Validate requirements against actual behavior
- **Concrete observations > abstract interpretation** - Document specific findings
- **Adaptive depth: time ∝ uncertainty** - Match exploration effort to requirement clarity
- **Exploration findings → specific clarifications** - Use observations to formulate questions
- **Always document** - Create artifacts for future reference
- **Link exploration → ambiguity → clarification** - Connect the workflow`,
  tags: ['exploration', 'protocol', 'adaptive'],
};
