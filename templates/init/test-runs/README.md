# Test Runs

This directory contains execution results and artifacts from test runs.

## Structure

Test runs are organized by timestamp and test case:
```
YYYYMMDD-HHMMSS/
├── TC-XXX/
│   ├── summary.json
│   ├── steps.json
│   └── video.webm
```

## Contents

Each test run includes:
- **summary.json**: Structured test result with video metadata and status
- **steps.json**: Detailed execution steps with timestamps and video synchronization
- **video.webm**: Video recording of the entire test execution

**Note**: All test information (status, failures, step details, observations) is captured in the structured JSON files. The video provides visual evidence synchronized with the steps.

## Test Result Schema

All test results follow the schema defined in `.bugzy/runtime/templates/test-result-schema.md`.

Key features:
- Video recording with synchronized step navigation
- Timestamped steps for precise playback control
- Structured metadata for test status, type, and priority
- User-friendly action descriptions for easy understanding

## Usage

Test runs are automatically generated when:
- Tests are executed via automation
- Manual test execution is logged
- Event processing triggers test validation

Results are used for:
- Issue tracking via the issue-tracker agent
- Learning extraction for continuous improvement
- Regression analysis and pattern recognition
