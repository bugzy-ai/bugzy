# Sub-Agent Memory: Maintenance Instructions

## What This Memory Is

A focused collection of knowledge relevant to your specific role. This is your working knowledge, not a log of interactions.

---

## When to ADD

Add when information:
- Directly impacts your decisions or outputs
- Represents a pattern or learning within your domain
- Prevents repeated mistakes in your area

**Check first**: Does this overlap with main agent knowledge or another sub-agent's domain?

---

## When to UPDATE

Update when:
- Preferences or requirements change within your domain
- Understanding deepens through repeated interactions
- Patterns evolve or are refined
- Multiple related facts can be consolidated

**Replace** outdated information with current understanding.

---

## When to REMOVE

Remove when:
- No longer relevant to current work
- Better handled by main agent's knowledge
- Proven incorrect or outdated
- Never actually used in decision-making

**Test**: "Has this influenced a decision recently? Will it influence one soon?"

---

## Core Rules

1. **Stay in your domain** - Don't duplicate main agent knowledge
2. **Operational over historical** - Keep patterns, not logs
3. **Patterns over instances** - Generalize from specific events
4. **Actionable over observational** - Every entry must answer "How does this change what I do?"
5. **Consolidate aggressively** - Aim for 10-30 high-signal entries
6. **Update as understanding crystallizes** - Refine vague into specific

---

## Quick Decision Tree

```
New information
│
├─ Relevant to my function? No → Ignore or suggest for main agent
│                           Yes ↓
│
├─ Actionable (changes what I do)? No → Don't store
│                                   Yes ↓
│
├─ Duplicates existing? Yes → UPDATE existing entry
│                       No ↓
│
└─ Belongs in main agent? Yes → Move to main agent
                          No → ADD to my memory
```

---

## Division with Main Agent

**Main Agent** stores:
- User's overall preferences and background
- Project-wide decisions
- Cross-cutting concerns

**You (Sub-Agent)** store:
- Domain-specific preferences and patterns
- Tactical learnings within your scope
- Working knowledge for your specific tasks

**When in doubt**: If multiple sub-agents could use it → Main agent

---

## Provenance Format

Every memory entry must include provenance metadata as an HTML comment immediately after the heading:

```markdown
## Entry Title
<!-- source: {your-role} | learned: {YYYY-MM-DD} | verified: {YYYY-MM-DD} -->

Entry content here...
```

**Fields:**
- **source**: Your subagent role (e.g., `test-engineer`, `browser-automation`)
- **learned**: Date the knowledge was first discovered
- **verified**: Date the knowledge was last confirmed as still accurate

**Verification Rule:** If an entry's `verified` date is more than 30 days old and you encounter the same topic, re-verify the information and update the `verified` date. If the fact has changed, update or remove the entry.

**Gradual Migration:** Existing entries without provenance remain valid. Add provenance when you next update an entry.

---

## Role-Specific Extraction Hints

Each role should focus on extracting knowledge within its domain:

- **test-engineer**: Selector strategies, page object patterns, framework conventions, test data patterns
- **test-debugger-fixer**: Failure patterns, root cause categories, fix strategies, flaky test indicators
- **team-communicator**: Channel configurations, message format preferences, thread conventions, escalation paths
- **browser-automation**: Timing patterns, navigation quirks, viewport requirements, wait strategies
- **issue-tracker**: Bug categorization, priority heuristics, label conventions, duplicate detection patterns
- **documentation-researcher**: Source reliability, content structure, search strategies, documentation gaps
