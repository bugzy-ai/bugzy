---
subcommand_name: handle-message
description: >-
  Handle team responses and Slack communications, maintaining context for
  ongoing conversations
allowed-tools: 'Read, Write, MultiEdit, Task, Grep'
argument-hint: '[slack thread context or team message]'
---
# Handle Message Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.testdata`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.testdata` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Process team responses from Slack threads and handle multi-turn conversations with the product team about testing clarifications, ambiguities, and questions.

## Arguments
Team message/thread context: $ARGUMENTS

## Process

### Step 1: Load Team Communication Context

#### 1.1 Read Team Communicator Memory
Read `.bugzy/runtime/memory/team-communicator.md` to:
- Find active conversations and thread contexts
- Load question-response patterns
- Get team communication preferences
- Check for similar past resolutions

#### 1.2 Parse Incoming Message Context
Extract from the arguments:
- **Thread ID/Timestamp**: If this is a response to a specific question
- **Channel Information**: Where the message originated
- **Message Content**: The actual team response or communication
- **Participants**: Who is involved in the conversation
- **Context Clues**: Any references to specific features, tests, or issues

### Step 2: Identify Message Type and Context

#### Message Categories:
1. **Response to Active Question**
   - Team member answering a specific question we asked
   - Provides clarification on uncertain behavior
   - Resolves ambiguity in test planning

2. **New Information/Update**
   - Team sharing updates about features or changes
   - New requirements or clarifications not requested
   - Proactive information sharing

3. **Follow-up Question**
   - Team asking for more details about our question
   - Requesting clarification on test approach
   - Asking about test results or findings

4. **General Discussion**
   - Broader conversation about testing strategy
   - Discussion of priorities or approaches
   - Planning or coordination messages

### Step 3: Context Matching and Retrieval

#### 3.1 Match to Active Conversations
If this is a response to a question we asked:
- Find the matching context in team-communicator memory
- Load the original uncertainty and exploration attempts
- Understand what specific clarification was needed
- Get the full history of this conversation thread

#### 3.2 Load Related Context
Based on message content, load relevant context:
- Current test plan state (`test-plan.md`)
- Related test cases (search `./test-cases/` directory)
- Relevant learnings from `.bugzy/runtime/learnings.md`
- Documentation context (if feature/component mentioned)

### Step 4: Analyze Team Response

#### 4.1 Classify Response Quality
- **Clear and Actionable**: Direct answer with clear direction
- **Partial Clarification**: Some clarity but may need follow-up
- **Redirect/Defer**: Pointing to other resources or people
- **Request for More Info**: Team needs additional context from us

#### 4.2 Extract Key Information
From team response, identify:
- **Definitive Answers**: Clear statements about intended behavior
- **Business Rules**: Requirements or constraints clarified
- **Priority Guidance**: What should/shouldn't be tested
- **Context/Background**: Additional information that helps understanding
- **Action Items**: Specific things team wants us to do

#### 4.3 Determine Impact Scope
Assess what needs to be updated based on the response:
- **Test Plan Updates**: New features, changed requirements, priority shifts
- **Test Case Changes**: Modified scenarios, new test data, updated steps
- **Learning Documentation**: New insights about product behavior
- **Future Testing**: Changes to testing approach or strategy

### Step 5: Execute Response Actions

#### 5.1 Documentation Updates
Based on team clarification, update relevant files:

**Test Plan Updates** (if needed):
- Add newly clarified features or requirements
- Update risk assessments based on business priorities
- Modify testing scope or approach as directed
- Add business rules or constraints explained by team

**Test Case Updates** (if needed):
- Create new test cases for clarified scenarios
- Modify existing test scenarios based on correct behavior
- Update test data requirements
- Add or remove test cases based on priority guidance

**Learning Documentation** (if needed):
- Document the clarification for future reference
- Record team preferences or patterns discovered
- Note business context that affects testing decisions
- Update understanding of product behavior

#### 5.2 Communication Actions

**Thread Response** (when appropriate):
Use the team-communicator agent to:
- Acknowledge the response and confirm understanding
- Ask follow-up questions if clarification is incomplete
- Share what actions we're taking based on their input
- Provide updates on changes made

**Status Updates** (when significant):
- Notify team when test plan or cases have been updated
- Report completion of actions they requested
- Share any new insights or discoveries from implementation

### Step 6: Update Team Communicator Memory

#### 6.1 Update Active Conversations

For resolved conversations:
- Mark status as "resolved"
- **Record resolution details for clarification protocol:**
  - Original uncertainty/ambiguity (what was unclear)
  - Severity level (CRITICAL/HIGH/MEDIUM/LOW)
  - Question(s) asked (exact wording)
  - Response received (team's answer)
  - Resolution date and timestamp
  - Actions taken based on clarification
  - Files/tests affected by the resolution
- Record response quality and effectiveness
- Move to "Resolved Questions" section with full context

**Memory format for resolved questions:**

Store using this structure (in markdown format):
- Title: ### Resolved: [Question Summary]
- **Date**: [timestamp]
- **Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
- **Original Uncertainty**: [what was unclear]
- **Question Asked**: [exact question text]
- **Response**: [team's answer]
- **Resolution**: [how we handled it - test updated, bug reported, etc.]
- **Related Files**: [test cases, plan sections, or other files affected]
- **Team Member**: [who provided the answer]

For ongoing conversations:
- Update conversation status
- Add latest response to thread history
- Note any pending actions or follow-ups needed
- Track severity if this is a clarification conversation

#### 6.2 Learn Communication Patterns

Update memory with insights about:
- **Team member expertise areas**: Who provides good answers for what topics
- **Response patterns**: What types of questions get quick/detailed responses
- **Communication preferences**: How team prefers to receive updates
- **Timing insights**: When team is most responsive
- **Clarification effectiveness by severity**:
  - Which severity levels get fastest responses
  - Most effective question formats per severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Team member expertise for different ambiguity types
  - Response quality patterns (clear answers vs. need for follow-up)

#### 6.3 Update Question Templates
If this interaction reveals better ways to ask questions:
- Refine question templates based on what worked well
- Note question formats that led to clear responses
- Update communication strategies that proved effective

#### 6.4 Update Clarification History

Maintain clarification history to support the clarification protocol's memory lookup (used by other tasks via Step X.3: Check Memory for Similar Clarifications):

**Store in team-communicator memory under "Resolved Questions" section:**

Use the format from Step 6.1 to ensure consistency (same structure as above).

**Purpose**: This format enables the clarification protocol (used in generate-test-plan, generate-test-cases, verify-changes) to find similar past clarifications and avoid asking redundant questions.

**Cross-reference patterns**: When storing, add tags/keywords so future lookups can find related clarifications:
- Feature area (login, checkout, admin, etc.)
- Ambiguity type (missing fields, unclear behavior, validation rules, etc.)
- Resolution pattern (test updated, bug confirmed, expected behavior, etc.)

**Example indexing**:

Organize resolved questions by topic for easy lookup:

Topic: Authentication & Login
- [2024-01-15] Resolved: User roles - basic users cannot edit shared todos
- [2024-01-10] Resolved: Session timeout behavior

Topic: Ordering & Sorting
- [2024-01-20] Resolved: Todo sorting should be by due date, completed items in separate archive (TODO-456)

This indexed structure makes it easy for the clarification protocol to check: Have we asked about similar ordering issues before?

### Step 7: Plan Follow-up Actions (if needed)

#### If Response is Complete:
- Close the uncertainty context
- Document lessons learned
- No further action needed for this thread

#### If Response Needs Follow-up:
Use the team-communicator agent to:
- Ask specific follow-up questions
- Request additional clarification on unclear points
- Confirm understanding of complex explanations
- Ask for prioritization if multiple options given

#### If Response Reveals New Uncertainties:
- Document new uncertainties discovered
- Plan exploration approach for new questions
- Determine if immediate follow-up needed or can wait

### Step 8: Contextual Memory Management

#### 8.1 Clean Up Resolved Contexts
- Archive completed uncertainty contexts
- Move resolved questions to reference section
- Clear temporary storage for closed conversations

#### 8.2 Prepare for Future Similar Questions
- Create patterns from successful resolutions
- Document reusable approaches for similar uncertainties
- Update team communication guidelines

## Key Principles

### Context Preservation
- Always maintain full conversation context
- Link responses back to original uncertainties
- Preserve reasoning chain for future reference

### Actionable Responses
- Convert team input into concrete actions
- Don't let clarifications sit without implementation
- Follow through on commitments made to team

### Learning Integration
- Each interaction improves our understanding
- Build knowledge base of team preferences
- Refine communication approaches over time

### Quality Communication
- Acknowledge team input appropriately
- Provide updates on actions taken
- Ask good follow-up questions when needed

## Important Considerations

### Thread Organization
- Keep related discussions in same thread
- Start new threads for new topics
- Maintain clear conversation boundaries

### Response Timing
- Acknowledge important messages promptly
- Allow time for implementation before status updates
- Don't spam team with excessive communications

### Action Prioritization
- Address urgent clarifications first
- Batch related updates when possible
- Focus on high-impact changes

### Memory Maintenance
- Keep active conversations visible and current
- Archive resolved discussions appropriately
- Maintain searchable history of resolutions
