---
version: 1.0.0
created_at: [DATE]
updated_at: [DATE]
status: draft
---

# Test Plan: [PROJECT_NAME]

## Overview

[2-3 sentences describing what the application does and the testing focus]

## Features to Test

### [Feature Area 1]
- [ ] Feature 1.1 - Brief description
- [ ] Feature 1.2 - Brief description

### [Feature Area 2]
- [ ] Feature 2.1 - Brief description
- [ ] Feature 2.2 - Brief description

### [Feature Area 3]
- [ ] Feature 3.1 - Brief description

## Out of Scope

- Item 1 - Reason (e.g., requires native mobile app)
- Item 2 - Reason (e.g., backend-only, no UI)

## Test Environment

- **URL**: TEST_BASE_URL
- **User Credentials**: TEST_USER_EMAIL / TEST_USER_PASSWORD
- **Admin Credentials**: TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD (if applicable)

## Automation Priority

| Priority | Criteria |
|----------|----------|
| High | Critical user flows, smoke tests, frequent regression areas |
| Medium | Important features, moderate user impact |
| Low | Edge cases, rarely used features |

## Notes

- See `./exploration-reports/` for detailed UI element discovery
- See `.bugzy/runtime/knowledge-base.md` for technical patterns
- See `.bugzy/runtime/project-context.md` for SDLC and team info
