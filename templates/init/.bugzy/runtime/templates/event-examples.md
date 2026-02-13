# Event Examples Template

This template provides examples of different event formats that can be processed by the `/process-event` command. Use these as references when triggering events.

## Natural Language Events

### Test Failures
```bash
/process-event "Login test failed with timeout error on Chrome"
/process-event "The checkout process is broken - users can't complete payment"
/process-event "TC-001 failed: Element not found after waiting 10 seconds"
```

### Discoveries
```bash
/process-event "Found new admin panel at /admin that's not documented"
/process-event "Discovered that users can bypass authentication by going directly to /dashboard"
/process-event "New feature: dark mode toggle in settings menu"
```

### User Feedback
```bash
/process-event "Customer complaint: checkout process too complicated, abandoned cart"
/process-event "Support ticket: users reporting slow page loads on mobile"
/process-event "User suggestion: add keyboard shortcuts for common actions"
```

## Structured Events (Key-Value Pairs)

### Test Event
```bash
/process-event --type test.failed --test-id TC-001 --error "Button not clickable" --browser Chrome
/process-event --type test.passed --test-id TC-045 --duration 45s --previously-flaky true
```

### Bug Report
```bash
/process-event --type bug.found --component auth --severity high --title "Login bypass vulnerability"
/process-event --type bug.fixed --bug-id BUG-123 --resolution "Updated validation logic"
```

### Feature Event
```bash
/process-event --type feature.added --name "Quick Actions" --location "dashboard" --documented false
/process-event --type requirement.changed --feature "Password Policy" --change "Minimum 12 characters"
```

## JSON Format Events

### Complex Test Failure
```bash
/process-event '{
  "type": "test.failed",
  "test_id": "TC-001",
  "title": "Login with valid credentials",
  "error": {
    "message": "Element not found",
    "selector": ".login-button",
    "timeout": 10000
  },
  "environment": {
    "browser": "Chrome 120",
    "os": "macOS",
    "viewport": "1920x1080"
  },
  "timestamp": "2025-01-25T10:30:00Z"
}'
```

### User Feedback with Context
```bash
/process-event '{
  "type": "user.feedback",
  "source": "support",
  "ticket_id": "SUP-456",
  "user_type": "premium",
  "issue": {
    "area": "checkout",
    "description": "Payment method not saving",
    "impact": "Cannot complete purchase",
    "frequency": "Always"
  }
}'
```

### Performance Issue
```bash
/process-event '{
  "type": "performance.issue",
  "page": "/dashboard",
  "metrics": {
    "load_time": 8500,
    "time_to_interactive": 12000,
    "largest_contentful_paint": 6500
  },
  "threshold_exceeded": true
}'
```

## YAML-like Format

### Simple Events
```bash
/process-event "type: test.failed, test: TC-001, browser: Firefox"
/process-event "type: bug.found, severity: medium, component: search"
/process-event "type: discovery, feature: API endpoint, path: /api/v2/users"
```

## Batch Events

### Multiple Related Issues
```bash
/process-event "Multiple login failures today: TC-001, TC-002, TC-003 all failing with similar timeout errors. Seems to be a systematic issue with the authentication service."
```

### Exploratory Testing Results
```bash
/process-event "Exploratory testing session results: Found 3 UI inconsistencies, 1 broken link, new feature in settings, and performance degradation on search page"
```

## Event Chains

Sometimes events are related and should reference each other:

### Initial Event
```bash
/process-event --type deployment --version 2.1.0 --environment staging
```

### Follow-up Event
```bash
/process-event "After deployment 2.1.0: 5 tests failing that were passing before"
```

## Special Cases

### Flaky Test Pattern
```bash
/process-event "TC-089 failed 3 times out of 10 runs - appears to be flaky"
```

### Environment-Specific
```bash
/process-event "All Safari tests failing but Chrome and Firefox pass"
```

### Data-Dependent
```bash
/process-event "Tests pass with test data but fail with production data"
```

## Tips for Event Creation

1. **Be Specific**: Include test IDs, error messages, and environment details
2. **Add Context**: Mention if issue is new, recurring, or related to recent changes
3. **Include Impact**: Describe how the issue affects users or testing
4. **Provide Evidence**: Include screenshots paths, logs, or session IDs if available
5. **Link Related Items**: Reference bug IDs, test cases, or previous events

## Common Patterns to Trigger

### Trigger Learning Extraction
```bash
/process-event "Discovered that all form validations fail when browser language is not English"
```

### Trigger Test Plan Update
```bash
/process-event "New payment provider integrated - Stripe checkout now available"
```

### Trigger Test Case Creation
```bash
/process-event "Found undocumented admin features that need test coverage"
```

### Trigger Bug Report
```bash
/process-event "Critical: Users lose data when session expires during form submission"
```

## Event Metadata

Events can include optional metadata:
- `priority`: high, medium, low
- `source`: automation, manual, support, monitoring
- `session_id`: For tracking related events
- `user`: Who reported or discovered
- `environment`: staging, production, development
- `tags`: Categories for filtering

Example with metadata:
```bash
/process-event --type issue --priority high --source monitoring --environment production --message "Memory leak detected in checkout service"
```