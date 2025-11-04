# Issue Tracker Agent

## Purpose
Manages all types of project issues including bugs, stories, and tasks in the project's issue tracking system. This agent creates detailed issue reports, manages story workflows through QA processes, tracks resolution status, and maintains comprehensive project work item visibility.

## Abstract Interface

### Core Capabilities
The issue tracker agent must provide these capabilities regardless of the underlying issue tracking system:

1. **Create and Manage Issues**
   - Generate detailed bug reports with reproduction steps
   - Create and update story tickets
   - Manage task assignments and status
   - Set appropriate severity, priority, and workflow states

2. **Link and Reference**
   - Link issues to test cases and stories
   - Reference related documentation
   - Connect to previous similar issues
   - Maintain traceability across work items

3. **Update and Track**
   - Update issue status and details
   - Add QA comments to stories
   - Track resolution progress
   - Manage story transitions (Dev → QA → Done)
   - Monitor fix verification

4. **Search and Query**
   - Find existing similar issues
   - Check for duplicates before creating
   - Query issues by various criteria
   - Track stories in QA status
   - Generate issue statistics

5. **Categorize and Organize**
   - Apply appropriate labels/tags
   - Assign to correct component/module
   - Set fix version/milestone
   - Manage issue lifecycle
   - Track sprint and release associations

## Expected Inputs

- **Issue Details**:
  - Issue Type (Bug/Story/Task)
  - Title/Summary
  - Description
  - For bugs: Reproduction steps, Expected vs Actual
  - For stories: Acceptance criteria, QA notes
  - Environment details
  - Severity/Priority

- **Context Information**:
  - Test case ID (for bugs)
  - Story ID (for QA comments)
  - Related feature or component
  - User impact assessment
  - Workaround if available

- **Supporting Data**:
  - Error messages
  - Stack traces
  - Screenshots
  - Log excerpts

## Expected Outputs

- **Issue Created/Updated**:
  - Issue ID/Number
  - URL to issue
  - Confirmation of fields set
  - Status transitions applied

- **Search Results**:
  - List of similar/related issues
  - Stories in QA status
  - Duplicate detection results

- **Update Confirmation**:
  - Status changes applied
  - QA comments added to stories
  - Links established
  - Workflow transitions completed


## Memory Management

The agent maintains persistent memory in `.bugzy/runtime/memory/issue-tracker.md` containing:

### Configuration
- Issue tracking system settings (project keys, database IDs, team IDs)
- Field mappings and custom field IDs
- Workflow states and transitions
- Default values and templates

### Issue Tracking History
- Recently reported issues with their IDs and status
- Stories currently in QA for testing
- Active tasks and their assignments
- Common issue patterns and their resolutions
- Duplicate detection patterns
- Component-to-team mappings

### Knowledge Base
- Frequently affected components
- Typical root causes for different error types
- Story workflow patterns
- QA process guidelines
- Resolution patterns and timeframes
- Escalation criteria and contacts

Memory file structure:
```markdown
# Issue Tracker Memory

## Configuration
- System: [Jira/Linear/Notion]
- Project/Database ID: [ID]
- Field Mappings: [mappings]

## Recent Issues
### Bugs
- [Bug ID]: [Title] - [Status] - [Component]

### Stories in QA
- [Story ID]: [Title] - [Assigned] - [Sprint]

### Active Tasks
- [Task ID]: [Title] - [Status] - [Owner]

## Patterns
- [Pattern]: [Typical resolution]
```

## Available Implementations

| Implementation | Issue Tracking System | Required MCP/Tools |
|---------------|----------------------|-------------------|
| `jira.md` | Jira | Jira API/MCP |
| `linear.md` | Linear | Linear API/MCP |
| `notion.md` | Notion Database | `mcp__notion__*` |

## Usage Examples

```markdown
# When processing test failure event
Use issue-tracker agent to:
1. Check if issue relates to story in QA
2. If story-related: Add QA comment
3. If regression: Create new bug
4. Link to failing test case
5. Set appropriate priority

# When story moves to QA
Use issue-tracker agent to:
1. Update story status to "QA"
2. Add initial QA assessment
3. Track in active QA stories
4. Notify QA team

# When updating issue status
Use issue-tracker agent to:
1. Find issue by ID
2. Update status appropriately
3. Add relevant notes
4. Update memory tracking
```

## Setup Instructions

To use this agent in your project:
1. Choose the implementation matching your issue tracking system
2. Copy the implementation file to `.claude/agents/issue-tracker.md`
3. Configure the required API access or MCP server
4. Set up project-specific fields (project key, workflow states, default values)

## Implementation Guidelines

Each implementation should:
- Check for duplicates before creating new issues
- Manage story workflow transitions
- Support QA commenting on stories
- Use consistent field mappings across systems
- Handle attachments and rich content appropriately
- Track all issue types in the configured system
- Provide clear error messages for failures
- Support batch operations when possible
- Maintain traceability through proper linking and references