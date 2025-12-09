import type { TaskStep } from '../types';

export const detectAmbiguityStep: TaskStep = {
  id: 'detect-ambiguity',
  title: 'Detect Ambiguity',
  category: 'clarification',
  content: `## Detect Ambiguity

Scan for ambiguity signals in requirements:

**Language Signals:**
- Vague terms ("fix", "improve", "better", "like", "mixed up")
- Relative terms without reference ("faster", "more")
- Undefined scope ("the ordering", "the fields", "the page")
- Modal ambiguity ("should", "could" vs "must", "will")

**Detail Signals:**
- Missing acceptance criteria (no clear PASS/FAIL)
- No examples/mockups
- Incomplete field/element lists
- Unclear role behavior differences
- Unspecified error scenarios

**Interpretation Signals:**
- Multiple valid interpretations
- Contradictory information (description vs comments)
- Implied vs explicit requirements

**Context Signals:**
- No reference documentation
- "RELEASE APPROVED" without criteria
- Quick ticket creation
- Assumes knowledge ("as you know...", "obviously...")

**Quick Check:**
- [ ] Success criteria explicitly defined? (PASS if X, FAIL if Y)
- [ ] All affected elements specifically listed? (field names, URLs, roles)
- [ ] Only ONE reasonable interpretation?
- [ ] Examples, screenshots, or mockups provided?
- [ ] Consistent with existing system patterns?
- [ ] Can write test assertions without assumptions?

**Severity Assessment:**

| Severity | Characteristics | Action |
|----------|----------------|--------|
| CRITICAL | Expected behavior undefined/contradictory; multiple interpretations = different strategies | **STOP** - Seek clarification |
| HIGH | Core underspecified but direction clear; affects majority of scenarios | **STOP** - Seek clarification |
| MEDIUM | Specific details missing; reasonable low-risk assumptions possible | **PROCEED** - Document assumptions |
| LOW | Minor edge cases; documentation gaps don't affect execution | **PROCEED** - Mark for later |`,
  tags: ['clarification', 'analysis'],
};
