# Team Communicator Agent

## Purpose
Facilitates clear, actionable communication between QA testing systems and product development teams through collaboration platforms. This agent bridges the gap between automated testing processes and human team members, ensuring critical information flows efficiently and questions get answered promptly.

## Abstract Interface

### Core Capabilities
The team communicator agent must provide these capabilities regardless of the underlying communication platform:

1. **Post Messages and Updates**
   - Send status updates about test runs and results
   - Share test plan completion and review requests
   - Notify team about critical issues and failures
   - Broadcast important discoveries and insights

2. **Ask Questions and Get Clarifications**
   - Post targeted questions about uncertain behaviors
   - Request feature clarifications and requirements
   - Ask for priority guidance on testing scope
   - Seek confirmation on business rules and workflows

3. **Thread Management**
   - Reply to existing conversations and threads
   - Maintain context across multi-turn discussions
   - Follow up on unanswered questions
   - Close resolved conversations appropriately

4. **Team Interaction**
   - React to messages with appropriate emojis
   - Acknowledge team responses and input
   - Tag relevant team members for specific questions
   - Use appropriate channels for different message types

5. **Communication Formatting**
   - Format messages for platform-specific display
   - Use structured templates for consistent communication
   - Include relevant context and supporting information
   - Apply appropriate urgency indicators and visual cues

## Expected Inputs

- **Status Updates**:
  - Test execution results and statistics
  - Test plan creation and completion
  - Bug discoveries and issue reports
  - Feature exploration outcomes

- **Questions and Clarifications**:
  - Uncertain behavior descriptions
  - Feature requirement questions
  - Priority and scope clarifications
  - Business rule confirmations

- **Context Information**:
  - Test case references and links
  - Documentation excerpts
  - Error messages and screenshots
  - Related conversations and threads

## Expected Outputs

- **Message Posted**:
  - Message ID/timestamp
  - Channel/thread confirmation
  - Delivery status

- **Response Processing**:
  - Team response analysis
  - Action items extracted
  - Context updates applied
  - Follow-up questions generated

- **Conversation Management**:
  - Thread status tracking
  - Unresolved question monitoring
  - Team response patterns learned

## Memory Management

The agent maintains persistent memory in `.bugzy/runtime/memory/team-communicator.md` containing:

### Active Conversations
- Ongoing question threads and their context
- Waiting responses and expected timelines
- Multi-turn conversation history
- Thread IDs and channel references

### Team Communication Patterns
- Response times and availability patterns
- Preferred communication styles and formats
- Team member expertise areas and roles
- Effective question templates and formats

### Resolution History
- Resolved questions and their answers
- Successful communication patterns
- Learning outcomes from team interactions
- Knowledge gained about product behavior

Memory file structure:
```markdown
# Team Communicator Memory

## Active Conversations
- [Thread ID]: [Context] - [Status] - [Last Activity]

## Team Preferences
- [Team Member]: [Expertise Areas] - [Communication Style]

## Communication Patterns
- [Question Type]: [Typical Response Quality] - [Best Practices]

## Resolved Questions
- [Date]: [Question] → [Resolution] - [Learning]
```

## Available Implementations

| Implementation | Communication Platform | Required MCP/Tools |
|---------------|----------------------|-------------------|
| `slack.md` | Slack Workspace | `mcp__slack__*` |

## Usage Examples

```markdown
# When test plan is complete
Use team-communicator agent to:
1. Post test plan completion update
2. Request team review and feedback
3. Highlight areas needing clarification
4. Ask for priority guidance on scope

# When critical test failures occur
Use team-communicator agent to:
1. Post urgent failure notification
2. Provide failure details and impact
3. Request immediate team attention
4. Tag relevant stakeholders

# When unclear behavior is discovered
Use team-communicator agent to:
1. Ask specific questions about expected behavior
2. Provide context about what was observed
3. Request clarification on business rules
4. Follow up until resolution is reached
```

## Setup Instructions

To use this agent in your project:
1. Choose the implementation matching your communication platform
2. Copy the implementation file to `.claude/agents/team-communicator.md`
3. Configure the required API access or MCP server
4. Set up channel mappings and team member roles
5. Initialize memory with team communication preferences

## Implementation Guidelines

Each implementation should:
- Use appropriate platform-specific formatting and features
- Maintain conversation context across interactions
- Apply urgency levels and visual indicators appropriately
- Learn from team responses to improve communication
- Handle platform rate limits and message constraints
- Provide clear error messages for communication failures
- Support different message types (updates, questions, alerts)
- Maintain professional and collaborative tone