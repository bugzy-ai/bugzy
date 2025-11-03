# Documentation Researcher Agent

## Purpose
Explores and retrieves project documentation to understand features, requirements, and system behavior. This agent serves as the primary knowledge gatherer for test planning and case generation.

## Abstract Interface

### Core Capabilities
The documentation researcher agent must provide these capabilities regardless of the underlying documentation system:

1. **Search Documentation**
   - Search by keywords, concepts, or natural language queries
   - Support filtering by document type, date, or relevance
   - Return ranked results with context

2. **Retrieve Content**
   - Fetch full documents or specific sections
   - Extract text, images, and structured data
   - Handle various content formats (markdown, rich text, tables)

3. **Navigate Structure**
   - Understand documentation hierarchy and relationships
   - Follow links and references between documents
   - Build a mental map of the documentation space

4. **Extract Information**
   - Identify key features and requirements
   - Extract user stories and acceptance criteria
   - Recognize test scenarios and edge cases

5. **Maintain Knowledge Base**
   - Remember previously discovered documentation
   - Track documentation changes over time
   - Build context from multiple searches

## Expected Inputs

- **Search queries**: Natural language or keyword-based queries
- **Document IDs**: Specific identifiers for direct retrieval
- **Filter criteria**: Type, date range, tags, or categories
- **Context**: Previous findings or related information

## Expected Outputs

- **Search results**: Ranked list of relevant documents with snippets
- **Document content**: Full or partial content in structured format
- **Extracted information**: Key points, requirements, test scenarios
- **Knowledge updates**: New discoveries to add to memory

## Memory Management

The agent should maintain persistent memory in `.bugzy/runtime/memory/documentation-researcher.md` containing:
- Documentation structure and organization
- Common search patterns and successful queries
- Key documents and their purposes
- Relationships between different documentation areas

## Available Implementations

| Implementation | Documentation System | Required MCP/Tools |
|---------------|---------------------|-------------------|
| `notion.md` | Notion | `mcp__notion__*` |
| `confluence.md` | Confluence | Confluence API |

## Usage Examples

```markdown
# When generating test plan
Use documentation-researcher agent to:
1. Search for product requirements
2. Retrieve feature specifications
3. Extract acceptance criteria
4. Identify test boundaries

# When processing events
Use documentation-researcher agent to:
1. Find related documentation for failed features
2. Verify expected behavior
3. Check for known limitations
```

## Setup Instructions

To use this agent in your project:
1. Choose the implementation that matches your documentation system
2. Copy the implementation file to `.claude/agents/documentation-researcher.md`
3. Configure the required MCP server or API access
4. The agent will be automatically available to Claude

## Implementation Guidelines

Each implementation should:
- Follow the abstract interface defined above
- Use tool-specific APIs efficiently
- Handle errors gracefully with fallback strategies
- Maintain consistent output format across implementations
- Update memory with discovered patterns and knowledge