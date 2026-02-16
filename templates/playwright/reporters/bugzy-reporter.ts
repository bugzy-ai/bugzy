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
 * Manifest execution entry
 */
interface ManifestExecution {
  number: number;
  status: string;
  duration: number;
  videoFile: string | null;
  hasTrace: boolean;
  hasScreenshots: boolean;
  error: string | null;
}

/**
 * Manifest test case entry
 */
interface ManifestTestCase {
  id: string;
  name: string;
  totalExecutions: number;
  finalStatus: string;
  executions: ManifestExecution[];
}

/**
 * Failure classification entry for new vs known failures
 */
interface FailureClassification {
  id: string;
  name: string;
  error: string | null;
  lastPassedRun: string | null;
}

/**
 * Manifest structure for test run sessions
 */
interface Manifest {
  bugzyExecutionId: string;
  timestamp: string;
  startTime: string;
  endTime: string;
  status: string;
  stats: {
    totalTests: number;
    passed: number;
    failed: number;
    totalExecutions: number;
  };
  testCases: ManifestTestCase[];
  new_failures?: FailureClassification[];
  known_failures?: FailureClassification[];
}

/**
 * Classify failures as new or known by checking previous test run manifests.
 *
 * A failure is "new" if the test passed in any of the last N runs.
 * A failure is "known" if the test failed in ALL of the last N runs (or no prior data exists for that specific test).
 * If there are no previous runs at all (first run), all failures are treated as "new".
 *
 * @param currentManifest - The current run's manifest
 * @param testRunsRoot - Path to the test-runs/ directory
 * @returns Object with newFailures and knownFailures arrays
 */
export function classifyFailures(
  currentManifest: Manifest,
  testRunsRoot: string
): { newFailures: FailureClassification[]; knownFailures: FailureClassification[] } {
  const lookback = parseInt(process.env.BUGZY_FAILURE_LOOKBACK || '5', 10);
  const newFailures: FailureClassification[] = [];
  const knownFailures: FailureClassification[] = [];

  // Get failed test cases from current manifest
  const failedTests = currentManifest.testCases.filter(
    tc => tc.finalStatus === 'failed' || tc.finalStatus === 'timedOut'
  );

  if (failedTests.length === 0) {
    return { newFailures, knownFailures };
  }

  // Read previous manifests
  const previousManifests: Manifest[] = [];
  if (fs.existsSync(testRunsRoot)) {
    const dirs = fs.readdirSync(testRunsRoot)
      .filter(d => {
        try {
          return fs.statSync(path.join(testRunsRoot, d)).isDirectory();
        } catch {
          return false;
        }
      })
      .sort()
      .reverse(); // Latest first

    for (const dir of dirs) {
      // Skip current run
      if (dir === currentManifest.timestamp) continue;

      if (previousManifests.length >= lookback) break;

      const manifestPath = path.join(testRunsRoot, dir, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          previousManifests.push(manifest);
        } catch {
          // Skip invalid manifests
        }
      }
    }
  }

  // If no previous runs exist, all failures are new (first run)
  if (previousManifests.length === 0) {
    for (const tc of failedTests) {
      const lastExec = tc.executions[tc.executions.length - 1];
      newFailures.push({
        id: tc.id,
        name: tc.name,
        error: lastExec?.error || null,
        lastPassedRun: null,
      });
    }
    return { newFailures, knownFailures };
  }

  // For each failed test, check if it passed in any previous run
  for (const tc of failedTests) {
    const lastExec = tc.executions[tc.executions.length - 1];
    let lastPassedRun: string | null = null;

    for (const prevManifest of previousManifests) {
      const prevTc = prevManifest.testCases.find(ptc => ptc.id === tc.id);
      if (prevTc && (prevTc.finalStatus === 'passed')) {
        lastPassedRun = prevManifest.timestamp;
        break;
      }
    }

    if (lastPassedRun) {
      // Test passed recently, so this is a new failure
      newFailures.push({
        id: tc.id,
        name: tc.name,
        error: lastExec?.error || null,
        lastPassedRun,
      });
    } else {
      // Check if test exists in any previous run at all
      const existsInPrevious = previousManifests.some(
        pm => pm.testCases.some(ptc => ptc.id === tc.id)
      );

      if (!existsInPrevious) {
        // New test that doesn't exist in history - treat as new failure
        newFailures.push({
          id: tc.id,
          name: tc.name,
          error: lastExec?.error || null,
          lastPassedRun: null,
        });
      } else {
        // Failed in all previous runs - known failure
        knownFailures.push({
          id: tc.id,
          name: tc.name,
          error: lastExec?.error || null,
          lastPassedRun: null,
        });
      }
    }
  }

  return { newFailures, knownFailures };
}

/**
 * Merge an existing manifest with the current run's manifest.
 * If existing is null, returns current as-is.
 * Deduplicates executions by number (current run wins on collision).
 * Recalculates stats from the merged data.
 */
export function mergeManifests(existing: Manifest | null, current: Manifest): Manifest {
  if (!existing) {
    return current;
  }

  // Build map of test cases by id from existing manifest
  const testCaseMap = new Map<string, ManifestTestCase>();
  for (const tc of existing.testCases) {
    testCaseMap.set(tc.id, { ...tc, executions: [...tc.executions] });
  }

  // Merge current run's test cases
  for (const tc of current.testCases) {
    const existingTc = testCaseMap.get(tc.id);
    if (existingTc) {
      // Merge executions: build a map keyed by execution number
      const execMap = new Map<number, ManifestExecution>();
      for (const exec of existingTc.executions) {
        execMap.set(exec.number, exec);
      }
      // Current run's executions overwrite on collision
      for (const exec of tc.executions) {
        execMap.set(exec.number, exec);
      }
      // Sort by execution number
      const mergedExecs = Array.from(execMap.values()).sort((a, b) => a.number - b.number);
      const finalStatus = mergedExecs[mergedExecs.length - 1].status;

      testCaseMap.set(tc.id, {
        id: tc.id,
        name: tc.name,
        totalExecutions: mergedExecs.length,
        finalStatus,
        executions: mergedExecs,
      });
    } else {
      // New test case from current run
      testCaseMap.set(tc.id, { ...tc, executions: [...tc.executions] });
    }
  }

  // Build merged test cases array
  const mergedTestCases = Array.from(testCaseMap.values());

  // Recalculate stats
  let totalTests = 0;
  let totalExecutions = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const tc of mergedTestCases) {
    totalTests++;
    totalExecutions += tc.executions.length;
    if (tc.finalStatus === 'passed') {
      passedTests++;
    } else {
      failedTests++;
    }
  }

  // Use earliest startTime, latest endTime
  const startTime = new Date(existing.startTime) < new Date(current.startTime)
    ? existing.startTime
    : current.startTime;
  const endTime = new Date(existing.endTime) > new Date(current.endTime)
    ? existing.endTime
    : current.endTime;

  // Status: if any test case failed, overall is failed
  const hasFailure = mergedTestCases.some(tc => tc.finalStatus === 'failed' || tc.finalStatus === 'timedOut');
  const status = hasFailure ? 'failed' : current.status;

  const merged: Manifest = {
    bugzyExecutionId: current.bugzyExecutionId,
    timestamp: existing.timestamp, // Keep original session timestamp
    startTime,
    endTime,
    status,
    stats: {
      totalTests,
      passed: passedTests,
      failed: failedTests,
      totalExecutions,
    },
    testCases: mergedTestCases,
  };

  // Preserve failure classification (current run's classification wins)
  if (current.new_failures) {
    merged.new_failures = current.new_failures;
  } else if (existing.new_failures) {
    merged.new_failures = existing.new_failures;
  }

  if (current.known_failures) {
    merged.known_failures = current.known_failures;
  } else if (existing.known_failures) {
    merged.known_failures = existing.known_failures;
  }

  return merged;
}

/**
 * Bugzy Custom Playwright Reporter
 *
 * Records test executions in hierarchical structure:
 * test-runs/YYYYMMDD-HHMMSS/TC-{id}/exec-{num}/
 *
 * Features:
 * - Groups multiple test runs under same directory when BUGZY_EXECUTION_ID matches
 * - Checks latest directory's manifest to reuse existing session directory
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
  private startTime!: Date;
  private testResults: Map<string, Array<any>> = new Map();
  private testSteps: Map<string, Array<StepData>> = new Map();
  private testStartTimes: Map<string, number> = new Map();

  constructor() {
    // No longer need to read execution number from environment
    // It will be auto-detected per test case
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

    const testRunsRoot = path.join(process.cwd(), 'test-runs');

    // Check if we should reuse an existing session
    let reuseDir: string | null = null;

    // If BUGZY_EXECUTION_ID is provided, use it directly
    if (process.env.BUGZY_EXECUTION_ID) {
      this.bugzyExecutionId = process.env.BUGZY_EXECUTION_ID;
    } else {
      // For local runs, check if we can reuse the latest session
      // Reuse if the latest manifest is within 60 minutes
      if (fs.existsSync(testRunsRoot)) {
        const dirs = fs.readdirSync(testRunsRoot)
          .filter(d => fs.statSync(path.join(testRunsRoot, d)).isDirectory())
          .sort()
          .reverse(); // Sort descending (latest first)

        if (dirs.length > 0) {
          const latestDir = dirs[0];
          const manifestPath = path.join(testRunsRoot, latestDir, 'manifest.json');

          if (fs.existsSync(manifestPath)) {
            try {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
              const manifestTime = new Date(manifest.startTime).getTime();
              const currentTime = this.startTime.getTime();
              const minutesDiff = (currentTime - manifestTime) / (1000 * 60);

              // Reuse if within 60 minutes and has a local execution ID
              if (minutesDiff <= 60 && manifest.bugzyExecutionId?.startsWith('local-')) {
                this.bugzyExecutionId = manifest.bugzyExecutionId;
                reuseDir = latestDir;
              }
            } catch (err) {
              // Ignore parsing errors
            }
          }
        }
      }

      // If no session to reuse, generate new local ID
      if (!this.bugzyExecutionId) {
        this.bugzyExecutionId = 'local-' + this.timestamp;
      }
    }

    // If we have a specific execution ID but haven't found a reuse dir yet, check for matching session
    if (!reuseDir && fs.existsSync(testRunsRoot)) {
      const dirs = fs.readdirSync(testRunsRoot)
        .filter(d => fs.statSync(path.join(testRunsRoot, d)).isDirectory())
        .sort()
        .reverse();

      for (const dir of dirs) {
        const manifestPath = path.join(testRunsRoot, dir, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            if (manifest.bugzyExecutionId === this.bugzyExecutionId) {
              reuseDir = dir;
              break;
            }
          } catch (err) {
            // Ignore parsing errors
          }
        }
      }
    }

    if (reuseDir) {
      this.testRunDir = path.join(testRunsRoot, reuseDir);
      console.log(`\n🔄 Continuing test run: ${reuseDir}`);
      console.log(`📋 Execution ID: ${this.bugzyExecutionId}`);
      console.log(`📁 Output directory: ${this.testRunDir}\n`);
    } else {
      this.testRunDir = path.join(testRunsRoot, this.timestamp);
      fs.mkdirSync(this.testRunDir, { recursive: true });
      console.log(`\n🆕 New test run: ${this.timestamp}`);
      console.log(`📋 Execution ID: ${this.bugzyExecutionId}`);
      console.log(`📁 Output directory: ${this.testRunDir}\n`);
    }
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

    // Auto-detect execution number from existing folders
    let executionNum = 1;
    if (fs.existsSync(testCaseDir)) {
      const existingExecs = fs.readdirSync(testCaseDir)
        .filter(d => d.startsWith('exec-') && fs.statSync(path.join(testCaseDir, d)).isDirectory())
        .map(d => parseInt(d.replace('exec-', ''), 10))
        .filter(n => !isNaN(n));

      if (existingExecs.length > 0) {
        executionNum = Math.max(...existingExecs) + 1;
      }
    }

    // Create execution directory
    const execDir = path.join(testCaseDir, `exec-${executionNum}`);
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
      number: executionNum,
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
    console.log(`${statusIcon} ${testId} [exec-${executionNum}] - ${result.status} (${result.duration}ms)`);
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

    // Build current run's manifest
    const currentManifest: Manifest = {
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

    // Read existing manifest for merge (if session is being reused)
    const manifestPath = path.join(this.testRunDir, 'manifest.json');
    let existingManifest: Manifest | null = null;
    if (fs.existsSync(manifestPath)) {
      try {
        existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      } catch (err) {
        console.warn(`⚠️ Could not parse existing manifest, will overwrite: ${err}`);
      }
    }

    // Merge with existing manifest data
    const merged = mergeManifests(existingManifest, currentManifest);

    // Classify failures as new vs known
    if (merged.stats.failed > 0) {
      try {
        const testRunsRoot = path.join(process.cwd(), 'test-runs');
        const { newFailures, knownFailures } = classifyFailures(merged, testRunsRoot);
        if (newFailures.length > 0) {
          merged.new_failures = newFailures;
        }
        if (knownFailures.length > 0) {
          merged.known_failures = knownFailures;
        }

        console.log(`\n🔍 Failure Classification:`);
        console.log(`   New failures: ${newFailures.length}`);
        console.log(`   Known failures: ${knownFailures.length}`);
      } catch (err) {
        console.warn(`⚠️ Could not classify failures: ${err}`);
      }
    }

    // Write atomically (temp file + rename)
    const tmpPath = manifestPath + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(merged, null, 2));
    fs.renameSync(tmpPath, manifestPath);

    console.log(`\n📊 Test Run Summary (this run):`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Total executions: ${totalExecutions}`);

    if (existingManifest) {
      console.log(`\n🔗 Merged with previous session data:`);
      console.log(`   Session total tests: ${merged.stats.totalTests}`);
      console.log(`   Session total executions: ${merged.stats.totalExecutions}`);
    }

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
