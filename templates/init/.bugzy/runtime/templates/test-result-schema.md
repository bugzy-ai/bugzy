# Test Result Schema

This document defines the structure for test execution results with video recording and structured reporting.

## Overview

There are two formats depending on the execution method:

1. **Automated Test Execution** - For Playwright test specs run via `/run-tests` command
2. **Manual Test Execution** - For manual test cases executed via browser-automation agent

---

## Automated Test Execution Format

Used by: `/run-tests` command with custom Bugzy reporter

### Directory Structure

```
test-runs/
  YYYYMMDD-HHMMSS/                    # Test run session
    execution-id.txt                  # BUGZY_EXECUTION_ID
    manifest.json                     # Run metadata and summary
    TC-001-login/                     # Test case folder
      exec-1/                         # First execution attempt
        result.json                   # Playwright result format
        video.webm                    # Video recording
        trace.zip                     # Trace (if failed)
        screenshots/                  # Screenshots (if failed)
      exec-2/                         # Re-run after fix (if applicable)
        result.json
        video.webm
    TC-002-navigation/
      exec-1/
        result.json
        video.webm
```

### execution-id.txt

Plain text file containing the BUGZY_EXECUTION_ID:
```
70a59676-cfd0-4ffd-b8ad-69ceff25c31d
```

### manifest.json

Overall test run metadata:

```json
{
  "bugzyExecutionId": "70a59676-cfd0-4ffd-b8ad-69ceff25c31d",
  "timestamp": "20251115-123456",
  "startTime": "2025-11-15T12:34:56.789Z",
  "endTime": "2025-11-15T12:45:23.456Z",
  "status": "passed",
  "stats": {
    "totalTests": 10,
    "passed": 8,
    "failed": 2,
    "totalExecutions": 12
  },
  "testCases": [
    {
      "id": "TC-001-login",
      "name": "Login functionality",
      "totalExecutions": 2,
      "finalStatus": "passed",
      "executions": [
        {
          "number": 1,
          "status": "failed",
          "duration": 5234,
          "videoFile": "video.webm",
          "hasTrace": true,
          "hasScreenshots": true,
          "error": "Locator.click: Timeout 30000ms exceeded..."
        },
        {
          "number": 2,
          "status": "passed",
          "duration": 4123,
          "videoFile": "video.webm",
          "hasTrace": false,
          "hasScreenshots": false,
          "error": null
        }
      ]
    }
  ]
}
```

### result.json (Per Execution)

Playwright test result format:

```json
{
  "status": "passed",
  "duration": 4123,
  "errors": [],
  "retry": 0,
  "startTime": "2025-11-15T12:34:56.789Z",
  "attachments": [
    {
      "name": "video",
      "path": "video.webm",
      "contentType": "video/webm"
    }
  ]
}
```

### steps.json (Per Execution - Optional)

Generated when test uses `test.step()` API for step-level tracking:

```json
{
  "steps": [
    {
      "index": 1,
      "timestamp": "2025-11-15T12:34:56.789Z",
      "videoTimeSeconds": 0,
      "action": "Navigate to login page",
      "status": "success",
      "description": "Navigate to login page - completed successfully",
      "technicalDetails": "test.step",
      "duration": 1234
    },
    {
      "index": 2,
      "timestamp": "2025-11-15T12:34:58.023Z",
      "videoTimeSeconds": 1,
      "action": "Login with valid credentials",
      "status": "success",
      "description": "Login with valid credentials - completed successfully",
      "technicalDetails": "test.step",
      "duration": 2145
    }
  ],
  "summary": {
    "totalSteps": 9,
    "successfulSteps": 9,
    "failedSteps": 0,
    "skippedSteps": 0
  }
}
```

**Field Descriptions**:
- `index`: Step number (1, 2, 3...)
- `timestamp`: ISO timestamp when step started
- `videoTimeSeconds`: Elapsed seconds from test start for video navigation
- `action`: Step title from `test.step('title', ...)`
- `status`: 'success', 'failed', or 'skipped'
- `description`: Step title + outcome
- `technicalDetails`: Always 'test.step' for automated tests
- `duration`: Step duration in milliseconds

For failed tests, includes trace and screenshots:

```json
{
  "status": "failed",
  "duration": 5234,
  "errors": [
    {
      "message": "Locator.click: Timeout 30000ms exceeded...",
      "stack": "Error: Locator.click: Timeout..."
    }
  ],
  "retry": 0,
  "startTime": "2025-11-15T12:34:56.789Z",
  "attachments": [
    {
      "name": "video",
      "path": "video.webm",
      "contentType": "video/webm"
    },
    {
      "name": "trace",
      "path": "trace.zip",
      "contentType": "application/zip"
    },
    {
      "name": "screenshot",
      "path": "screenshots/failure.png",
      "contentType": "image/png"
    }
  ]
}
```

---

## Manual Test Execution Format

Used by: browser-automation agent for markdown test cases

### File Structure

Each test execution creates a folder: `test-runs/YYYYMMDD-HHMMSS/TC-XXX/`

Required files:
- `summary.json` - Structured test result data with metadata and status
- `steps.json` - Detailed execution steps with timestamps and video synchronization
- Video file in `.playwright-mcp/` folder (uploaded to GCS separately)

## summary.json Format

### Example: Passed Test
```json
{
  "testRun": {
    "id": "TC-001",
    "testCaseName": "User can successfully log in",
    "status": "PASS",
    "type": "functional",
    "priority": "high",
    "duration": {
      "minutes": 2,
      "seconds": 45
    }
  },
  "executionSummary": {
    "totalPhases": 5,
    "phasesCompleted": 5,
    "overallResult": "All phases completed successfully",
    "browserUsed": "chromium"
  },
  "video": {
    "filename": "video.webm",
    "durationSeconds": 165,
    "sizeBytes": 1234567
  },
  "metadata": {
    "executionId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2025-10-14T10:30:00Z",
    "endTime": "2025-10-14T10:32:45Z",
    "testRunFolder": "test-runs/20251014-103000"
  }
}
```

### Example: Failed Test
```json
{
  "testRun": {
    "id": "TC-001",
    "testCaseName": "User can successfully log in",
    "status": "FAIL",
    "type": "functional",
    "priority": "high",
    "failureReason": "Timeout waiting for login button at step 4",
    "duration": {
      "minutes": 1,
      "seconds": 30
    }
  },
  "executionSummary": {
    "totalPhases": 5,
    "phasesCompleted": 3,
    "overallResult": "Failed at phase 4: Button element not found",
    "browserUsed": "chromium"
  },
  "video": {
    "filename": "video.webm",
    "durationSeconds": 90,
    "sizeBytes": 734821
  },
  "metadata": {
    "executionId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2025-10-14T10:30:00Z",
    "endTime": "2025-10-14T10:31:30Z",
    "testRunFolder": "test-runs/20251014-103000"
  }
}
```

### Example: Skipped Test
```json
{
  "testRun": {
    "id": "TC-003",
    "testCaseName": "Project Settings Update",
    "status": "SKIP",
    "type": "functional",
    "priority": "high",
    "skipReason": "Dependency failed: TC-001 (Login) - Timeout waiting for login button at step 4",
    "duration": {
      "minutes": 0,
      "seconds": 0
    }
  },
  "executionSummary": {
    "totalPhases": 0,
    "phasesCompleted": 0,
    "overallResult": "Test skipped due to blocker failure"
  },
  "metadata": {
    "executionId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2025-10-14T10:30:00Z",
    "endTime": "2025-10-14T10:30:00Z",
    "testRunFolder": "test-runs/20251014-103000"
  }
}
```

## steps.json Format

### Example: Executed Test
```json
{
  "steps": [
    {
      "index": 1,
      "timestamp": "2025-10-14T10:30:05Z",
      "videoTimeSeconds": 5.2,
      "action": "Navigate to login page",
      "status": "success",
      "description": "Opened https://example.com/login and verified page loaded",
      "technicalDetails": "browser.goto('https://example.com/login')"
    },
    {
      "index": 2,
      "timestamp": "2025-10-14T10:30:12Z",
      "videoTimeSeconds": 12.8,
      "action": "Enter username",
      "status": "success",
      "description": "Filled in username field with test user credentials",
      "technicalDetails": "page.fill('#username', 'testuser@example.com')"
    },
    {
      "index": 3,
      "timestamp": "2025-10-14T10:30:15Z",
      "videoTimeSeconds": 15.4,
      "action": "Enter password",
      "status": "success",
      "description": "Filled in password field",
      "technicalDetails": "page.fill('#password', '***')"
    },
    {
      "index": 4,
      "timestamp": "2025-10-14T10:30:18Z",
      "videoTimeSeconds": 18.1,
      "action": "Click login button",
      "status": "success",
      "description": "Clicked the login button to submit credentials",
      "technicalDetails": "page.click('button[type=\"submit\"]')"
    },
    {
      "index": 5,
      "timestamp": "2025-10-14T10:30:22Z",
      "videoTimeSeconds": 22.7,
      "action": "Verify successful login",
      "status": "success",
      "description": "Confirmed redirect to dashboard and welcome message displayed",
      "technicalDetails": "expect(page).toHaveURL('/dashboard')"
    }
  ],
  "summary": {
    "totalSteps": 5,
    "successfulSteps": 5,
    "failedSteps": 0,
    "skippedSteps": 0
  }
}
```

### Example: Skipped Test
```json
{
  "steps": [],
  "summary": {
    "totalSteps": 0,
    "successfulSteps": 0,
    "failedSteps": 0,
    "skippedSteps": 0,
    "skipNote": "Test was not executed because dependency TC-001 (Login) failed"
  }
}
```

## Field Descriptions

### summary.json

**testRun:**
- `id` - Test case identifier (e.g., TC-001)
- `testCaseName` - Human-readable test name
- `status` - Overall test result: PASS, FAIL, or SKIP
- `type` - Test type: functional, exploratory, regression, or smoke
- `priority` - Test priority level
- `failureReason` - Explanation of failure (only present if status is FAIL)
- `skipReason` - Explanation of why test was skipped (only present if status is SKIP). Format: "Dependency failed: TC-XXX (Test Name) - Failure reason"
- `duration` - Test execution time

**executionSummary:**
- `totalPhases` - Number of test phases/sections
- `phasesCompleted` - How many phases were executed
- `overallResult` - Human-readable summary
- `browserUsed` - Browser engine (chromium, firefox, webkit)

**video:**
- `filename` - Video filename in .playwright-mcp/ folder (e.g., "test-abc123.webm")
- Agent stores ONLY the filename
- External service uploads video to GCS after task completion
- UI streams video via signed URLs from GCS

**metadata:**
- `executionId` - UUID of the task execution (used to construct GCS paths for video streaming)
- `startTime` - ISO 8601 timestamp when test started
- `endTime` - ISO 8601 timestamp when test completed
- `testRunFolder` - Path to test run folder (timestamp-based folder name in git repository)

### steps.json

**steps array:**
- `index` - Step number (1-indexed)
- `timestamp` - ISO 8601 timestamp when step executed
- `videoTimeSeconds` - Corresponding time in video (for synchronization)
- `action` - User-friendly action description (shown in UI)
- `status` - Step result: success, failed, or skipped
- `description` - Detailed explanation of what happened
- `technicalDetails` - Technical command/code for debugging (optional)

**summary:**
- `totalSteps` - Total number of steps
- `successfulSteps` - Steps that passed
- `failedSteps` - Steps that failed
- `skippedSteps` - Steps that were skipped
- `skipNote` - Optional explanation of why entire test was skipped (only present when steps array is empty and test was skipped)

## Video Recording

- Format: WebM with VP9 codec
- Resolution: Playwright default (typically 1280x720)
- Frame rate: 25 fps
- Audio: Not recorded
- Location: Remains in `.playwright-mcp/` folder (not copied or moved)
- Storage: External service uploads to GCS after task completes
- Access: UI fetches signed URLs for streaming

## Usage Guidelines

### For Test Execution
1. Start video recording before test begins
2. Track each significant action with timestamp
3. Use user-friendly language for actions (not technical details)
4. Record video timestamp at each step
5. Extract execution ID from BUGZY_EXECUTION_ID environment variable
6. Generate both summary.json and steps.json
7. Find latest video in `.playwright-mcp/`: `basename $(ls -t .playwright-mcp/*.webm | head -1)`
8. Store execution ID in metadata.executionId field: `{ "metadata": { "executionId": "uuid-from-env" } }`
9. Store ONLY filename in summary.json: `{ "video": { "filename": "test-abc123.webm" } }`
10. Do NOT copy, move, or delete videos - external service handles uploads
11. Do NOT perform git operations - external service handles commits/pushes

### For UI Display
1. Load summary.json for test overview
2. Load steps.json for timeline navigation
3. Extract executionId from summary.json metadata (required for GCS video path)
4. Fetch signed video URL from API: `/api/projects/{projectId}/test-runs/{executionId}/videos/{filename}`
5. Display video with synchronized step highlighting using signed URL
6. Allow clicking steps to jump to video timestamp
7. Highlight current step based on video playback time
8. Show test metadata and status clearly

## Migration from Old Format

Old format (screenshots):
```
test-runs/YYYYMMDD-HHMMSS/TC-XXX/
├── test-log.md
├── summary.json (old format)
├── findings.md
└── screenshots/
    ├── step1.png
    ├── step2.png
    └── step3.png
```

New format (video + structured steps):
```
test-runs/YYYYMMDD-HHMMSS/TC-XXX/
├── summary.json (new format with video metadata)
├── steps.json (structured steps with timestamps)
└── video.webm (video recording)
```

**Note**: `test-log.md` and `findings.md` are no longer generated:
- Step-by-step information → `steps.json` (timestamps, actions, descriptions, status)
- Test findings/failures → `summary.json` (`failureReason` field) or `steps.json` (`description` fields)

UI handles both old and new formats gracefully for backwards compatibility.
