import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
  TestStep,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Step data for steps.json
 */
interface StepData {
  index: number;
  timestamp: string;
  videoTimeSeconds: number;
  action: string;
  status: 'success' | 'failed' | 'skipped';
  description: string;
  technicalDetails: string;
  duration?: number;
}

/**
 * Bugzy Custom Playwright Reporter
 *
 * Records test executions in hierarchical structure:
 * test-runs/YYYYMMDD-HHMMSS/TC-{id}/exec-{num}/
 *
 * Features:
 * - Tracks multiple execution attempts per test
 * - Records videos for all tests
 * - Captures traces/screenshots for failures only
 * - Links to BUGZY_EXECUTION_ID for session tracking
 * - Generates manifest.json with execution summary
 * - Generates steps.json with video timestamps for test.step() calls
 */
class BugzyReporter implements Reporter {
  private testRunDir!: string;
  private timestamp!: string;
  private bugzyExecutionId!: string;
  private executionNum: number;
  private startTime!: Date;
  private testResults: Map<string, Array<any>> = new Map();
  private testSteps: Map<string, Array<StepData>> = new Map();
  private testStartTimes: Map<string, number> = new Map();

  constructor() {
    // Read execution number from environment (defaults to 1)
    this.executionNum = parseInt(process.env.BUGZY_EXECUTION_NUM || '1', 10);
  }

  /**
   * Called once before running tests
   */
  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = new Date();

    // Generate timestamp in YYYYMMDD-HHMMSS format
    this.timestamp = this.startTime
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/T/, '-')
      .slice(0, 15);

    // Read BUGZY_EXECUTION_ID from environment
    this.bugzyExecutionId = process.env.BUGZY_EXECUTION_ID || 'local-' + this.timestamp;

    // Create test run directory
    this.testRunDir = path.join(process.cwd(), 'test-runs', this.timestamp);
    fs.mkdirSync(this.testRunDir, { recursive: true });

    console.log(`\n🧪 Bugzy Test Run: ${this.timestamp}`);
    console.log(`📋 Execution ID: ${this.bugzyExecutionId}`);
    console.log(`📁 Output directory: ${this.testRunDir}`);
    console.log(`🔢 Execution number: ${this.executionNum}\n`);
  }

  /**
   * Called after each test completes
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    // Extract test ID from test title or file path
    const testId = this.extractTestId(test);

    // Create test case directory
    const testCaseDir = path.join(this.testRunDir, testId);
    fs.mkdirSync(testCaseDir, { recursive: true });

    // Create execution directory
    const execDir = path.join(testCaseDir, `exec-${this.executionNum}`);
    fs.mkdirSync(execDir, { recursive: true });

    // Prepare result data in Playwright format
    const resultData = {
      status: result.status,
      duration: result.duration,
      errors: result.errors,
      retry: result.retry,
      startTime: result.startTime.toISOString(),
      attachments: [] as Array<{ name: string; path: string; contentType: string }>,
    };

    // Handle attachments (videos, traces, screenshots)
    let hasVideo = false;
    let hasTrace = false;
    let hasScreenshots = false;

    for (const attachment of result.attachments) {
      if (attachment.name === 'video' && attachment.path) {
        // Copy video file to execution directory
        const videoFileName = 'video.webm';
        const videoDestPath = path.join(execDir, videoFileName);

        try {
          fs.copyFileSync(attachment.path, videoDestPath);
          resultData.attachments.push({
            name: 'video',
            path: videoFileName,
            contentType: attachment.contentType || 'video/webm',
          });
          hasVideo = true;
        } catch (err) {
          console.error(`Failed to copy video: ${err}`);
        }
      } else if (attachment.name === 'trace' && attachment.path) {
        // Copy trace file to execution directory (only for failures)
        if (result.status === 'failed' || result.status === 'timedOut') {
          const traceFileName = 'trace.zip';
          const traceDestPath = path.join(execDir, traceFileName);

          try {
            fs.copyFileSync(attachment.path, traceDestPath);
            resultData.attachments.push({
              name: 'trace',
              path: traceFileName,
              contentType: attachment.contentType || 'application/zip',
            });
            hasTrace = true;
          } catch (err) {
            console.error(`Failed to copy trace: ${err}`);
          }
        }
      } else if (attachment.name === 'screenshot' && attachment.path) {
        // Copy screenshots to execution directory (only for failures)
        if (result.status === 'failed' || result.status === 'timedOut') {
          const screenshotsDir = path.join(execDir, 'screenshots');
          fs.mkdirSync(screenshotsDir, { recursive: true });

          const screenshotFileName = path.basename(attachment.path);
          const screenshotDestPath = path.join(screenshotsDir, screenshotFileName);

          try {
            fs.copyFileSync(attachment.path, screenshotDestPath);
            resultData.attachments.push({
              name: 'screenshot',
              path: path.join('screenshots', screenshotFileName),
              contentType: attachment.contentType || 'image/png',
            });
            hasScreenshots = true;
          } catch (err) {
            console.error(`Failed to copy screenshot: ${err}`);
          }
        }
      }
    }

    // Write result.json
    const resultPath = path.join(execDir, 'result.json');
    fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));

    // Store execution info for manifest
    if (!this.testResults.has(testId)) {
      this.testResults.set(testId, []);
    }

    this.testResults.get(testId)!.push({
      number: this.executionNum,
      status: result.status,
      duration: result.duration,
      videoFile: hasVideo ? 'video.webm' : null,
      hasTrace,
      hasScreenshots,
      error: result.errors.length > 0 ? result.errors[0].message : null,
    });

    // Generate steps.json if test has steps
    const testKey = this.getTestKey(test);
    const steps = this.testSteps.get(testKey);
    if (steps && steps.length > 0) {
      const stepsData = {
        steps,
        summary: {
          totalSteps: steps.length,
          successfulSteps: steps.filter(s => s.status === 'success').length,
          failedSteps: steps.filter(s => s.status === 'failed').length,
          skippedSteps: steps.filter(s => s.status === 'skipped').length,
        },
      };

      const stepsPath = path.join(execDir, 'steps.json');
      fs.writeFileSync(stepsPath, JSON.stringify(stepsData, null, 2));
    }

    // Log execution result
    const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${testId} [exec-${this.executionNum}] - ${result.status} (${result.duration}ms)`);
  }

  /**
   * Called when a test step begins
   */
  onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void {
    // Only track test.step() calls (not hooks, fixtures, or expects)
    if (step.category !== 'test.step') {
      return;
    }

    const testKey = this.getTestKey(test);

    // Record test start time on first step
    if (!this.testStartTimes.has(testKey)) {
      this.testStartTimes.set(testKey, step.startTime.getTime());
    }

    // Initialize steps array for this test
    if (!this.testSteps.has(testKey)) {
      this.testSteps.set(testKey, []);
    }

    const steps = this.testSteps.get(testKey)!;
    const testStartTime = this.testStartTimes.get(testKey)!;
    const videoTimeSeconds = Math.floor((step.startTime.getTime() - testStartTime) / 1000);

    steps.push({
      index: steps.length + 1,
      timestamp: step.startTime.toISOString(),
      videoTimeSeconds,
      action: step.title,
      status: 'success', // Will be updated in onStepEnd if it fails
      description: `${step.title} - in progress`,
      technicalDetails: 'test.step',
    });
  }

  /**
   * Called when a test step ends
   */
  onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
    // Only track test.step() calls
    if (step.category !== 'test.step') {
      return;
    }

    const testKey = this.getTestKey(test);
    const steps = this.testSteps.get(testKey);

    if (!steps || steps.length === 0) {
      return;
    }

    // Update the last step with final status and duration
    const lastStep = steps[steps.length - 1];
    lastStep.duration = step.duration;

    if (step.error) {
      lastStep.status = 'failed';
      lastStep.description = `${step.title} - failed: ${step.error.message}`;
    } else {
      lastStep.status = 'success';
      lastStep.description = `${step.title} - completed successfully`;
    }
  }

  /**
   * Called after all tests complete
   */
  onEnd(result: FullResult): void {
    const endTime = new Date();

    // Calculate statistics
    let totalTests = 0;
    let totalExecutions = 0;
    let passedTests = 0;
    let failedTests = 0;

    const testCases: Array<any> = [];

    for (const [testId, executions] of this.testResults.entries()) {
      totalTests++;
      totalExecutions += executions.length;

      const finalStatus = executions[executions.length - 1].status;
      if (finalStatus === 'passed') {
        passedTests++;
      } else {
        failedTests++;
      }

      testCases.push({
        id: testId,
        name: testId.replace(/^TC-\d+-/, '').replace(/-/g, ' '),
        totalExecutions: executions.length,
        finalStatus,
        executions,
      });
    }

    // Generate manifest.json
    const manifest = {
      bugzyExecutionId: this.bugzyExecutionId,
      timestamp: this.timestamp,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: result.status,
      stats: {
        totalTests,
        passed: passedTests,
        failed: failedTests,
        totalExecutions,
      },
      testCases,
    };

    const manifestPath = path.join(this.testRunDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n📊 Test Run Summary:`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Total executions: ${totalExecutions}`);
    console.log(`   Manifest: ${manifestPath}\n`);
  }

  /**
   * Extract test ID from test case
   * Generates TC-XXX-{test-name} format
   */
  private extractTestId(test: TestCase): string {
    // Try to extract from test title
    const title = test.title.toLowerCase().replace(/\s+/g, '-');

    // Get test file name without extension
    const fileName = path.basename(test.location.file, path.extname(test.location.file));

    // Extract number from filename if it follows TC-XXX pattern
    const tcMatch = fileName.match(/TC-(\d+)/i);
    if (tcMatch) {
      return `TC-${tcMatch[1]}-${title}`;
    }

    // Otherwise generate from index
    // This is a simple fallback - you may want to improve this
    const testIndex = String(test.parent.tests.indexOf(test) + 1).padStart(3, '0');
    return `TC-${testIndex}-${title}`;
  }

  /**
   * Generate unique key for test to track steps across retries
   */
  private getTestKey(test: TestCase): string {
    return `${test.location.file}::${test.title}`;
  }
}

export default BugzyReporter;
