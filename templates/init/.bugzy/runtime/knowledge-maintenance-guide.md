# Knowledge Maintenance Guide

## Overview

This document provides instructions for maintaining a **Context** or **Knowledge Base** - a living collection of factual knowledge that is actively curated and updated rather than simply accumulated over time.

---

## Core Principle: This is a Curated Snapshot, Not a Log

This document represents **what we currently know and believe to be true**, not a history of what we've learned. Think of it as a living reference that evolves as understanding improves.

---

## When to ADD

Add new entries when:

- New factual information is discovered
- New patterns or relationships emerge
- New areas of knowledge become relevant

**Check first**: Does this duplicate or overlap with existing entries?

---

## When to UPDATE

Update existing entries when:

- Facts change or we discover more accurate information
- Understanding deepens (replace shallow with deeper insight)
- Multiple related facts can be consolidated into one coherent statement
- Language can be clarified or made more precise

**Goal**: Replace outdated understanding with current understanding

---

## When to REMOVE

Remove entries when:

- Information becomes irrelevant to current needs
- Facts are proven incorrect (unless there's value in noting the correction)
- Information is superseded by better, more comprehensive entries
- Entry is redundant with other content

**Key question**: "If someone reads this in 6 months, will it help them?"

---

## Maintenance Principles

### 1. Favor Consolidation Over Addition

- Before adding, ask: "Can this merge with existing knowledge?"
- Example: Instead of 10 facts about a person, maintain 2-3 well-organized paragraphs

### 2. Update Rather Than Append

- When information evolves, replace the old statement
- Keep history only if the evolution itself is important
- Example: ~~"User is learning Python"~~ → "User is proficient in Python and focusing on FastAPI"

### 3. Regular Pruning

- Periodically review for outdated or low-value entries
- Ask: "Is this still accurate? Still relevant? Could it be stated better?"
- Aim for signal-to-noise ratio improvement

### 4. Quality Over Completeness

- Better to have 50 highly relevant, accurate facts than 500 marginally useful ones
- Prioritize insights over raw data
- Focus on what's actionable or decision-relevant

### 5. Resolve Contradictions Immediately

- If new information contradicts old, investigate and keep only the truth
- Don't accumulate conflicting statements

### 6. Use Clear, Declarative Statements

- Write in present tense: "User works at X" not "User mentioned they work at X"
- State facts confidently when known; flag uncertainty when it exists
- Avoid hedging unless genuinely uncertain

---

## Anti-Patterns to Avoid

| ❌ Don't Do This | ✅ Do This Instead |
|-----------------|-------------------|
| "On Tuesday user said X, then on Friday user said Y" | "User's position on X is Y" (keep most current) |
| Keeping every detail ever mentioned | Keeping relevant, current details |
| "User might like coffee, user mentioned tea once, user drinks water" | "User prefers tea; also drinks coffee occasionally" |

---

## Extraction Schema

When deciding what to save, use these structured categories as guidance. Not every session produces entries in every category — only save what genuinely qualifies.

### Application Patterns
UI flows, navigation structure, page load behaviors, API response patterns, authentication flows, state transitions.

### Test Reliability
Flaky selectors, timing-sensitive flows, environment-specific behaviors, retry patterns, stable vs unstable locators.

### Team Preferences
Communication style, channel routing, workflow expectations, review preferences, notification conventions.

### Technical Constraints
API rate limits, auth token lifetimes, infrastructure boundaries, deployment gotchas, browser compatibility issues.

### Environment Facts
URLs, credentials structure (not values), test data patterns, feature flags, environment-specific configurations.

---

## Provenance Format

Every knowledge base entry must include provenance metadata as an HTML comment immediately after the heading:

```markdown
## Entry Title
<!-- source: {task-or-subagent} | learned: {YYYY-MM-DD} | verified: {YYYY-MM-DD} -->

Entry content here...
```

**Fields:**
- **source**: Which task or subagent produced this knowledge (e.g., `run-tests`, `test-engineer`, `explore-application`)
- **learned**: Date the knowledge was first discovered
- **verified**: Date the knowledge was last confirmed as still accurate

**Verification Rule:** If an entry's `verified` date is more than 30 days old and you encounter the same topic, re-verify the information and update the `verified` date. If the fact has changed, update or remove the entry.

**Gradual Migration:** Existing entries without provenance remain valid. Add provenance when you next update an entry — no bulk migration needed.
