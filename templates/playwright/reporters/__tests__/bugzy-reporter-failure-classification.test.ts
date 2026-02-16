import { test, expect } from '@playwright/test';
import { classifyFailures } from '../bugzy-reporter';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function makeManifest(overrides: Partial<{
  timestamp: string;
  testCases: Array<{
    id: string;
    name: string;
    totalExecutions: number;
    finalStatus: string;
    executions: Array<{
      number: number;
      status: string;
      duration: number;
      videoFile: string | null;
      hasTrace: boolean;
      hasScreenshots: boolean;
      error: string | null;
    }>;
  }>;
}> = {}) {
  const testCases = overrides.testCases ?? [];
  const totalExecutions = testCases.reduce((sum, tc) => sum + tc.executions.length, 0);
  const passed = testCases.filter(tc => tc.finalStatus === 'passed').length;
  const failed = testCases.length - passed;

  return {
    bugzyExecutionId: 'local-test',
    timestamp: overrides.timestamp ?? '20260216-120000',
    startTime: '2026-02-16T12:00:00.000Z',
    endTime: '2026-02-16T12:01:00.000Z',
    status: failed > 0 ? 'failed' : 'passed',
    stats: { totalTests: testCases.length, passed, failed, totalExecutions },
    testCases,
  };
}

function makeTestCase(id: string, finalStatus: string, error?: string) {
  return {
    id,
    name: id.replace(/^TC-\d+-/, '').replace(/-/g, ' '),
    totalExecutions: 1,
    finalStatus,
    executions: [{
      number: 1,
      status: finalStatus,
      duration: 1000,
      videoFile: null,
      hasTrace: false,
      hasScreenshots: false,
      error: error ?? null,
    }],
  };
}

function setupTestRunsDir(manifests: Array<{ timestamp: string; manifest: any }>) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bugzy-test-'));
  const testRunsRoot = path.join(tmpDir, 'test-runs');
  fs.mkdirSync(testRunsRoot, { recursive: true });

  for (const { timestamp, manifest } of manifests) {
    const runDir = path.join(testRunsRoot, timestamp);
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(
      path.join(runDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }

  return testRunsRoot;
}

test.describe('classifyFailures', () => {
  test('returns empty arrays when no failures', () => {
    const manifest = makeManifest({
      testCases: [makeTestCase('TC-001-login', 'passed')],
    });

    const result = classifyFailures(manifest, '/nonexistent');

    expect(result.newFailures).toHaveLength(0);
    expect(result.knownFailures).toHaveLength(0);
  });

  test('all failures are new when no previous runs exist', () => {
    const manifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [
        makeTestCase('TC-001-login', 'failed', 'timeout'),
        makeTestCase('TC-002-checkout', 'failed', 'element not found'),
      ],
    });

    const testRunsRoot = setupTestRunsDir([]);

    const result = classifyFailures(manifest, testRunsRoot);

    expect(result.newFailures).toHaveLength(2);
    expect(result.knownFailures).toHaveLength(0);
    expect(result.newFailures[0].id).toBe('TC-001-login');
    expect(result.newFailures[0].error).toBe('timeout');
    expect(result.newFailures[1].id).toBe('TC-002-checkout');
  });

  test('failure is new when test passed in recent run', () => {
    const previousManifest = makeManifest({
      timestamp: '20260215-120000',
      testCases: [
        makeTestCase('TC-001-login', 'passed'),
        makeTestCase('TC-002-checkout', 'passed'),
      ],
    });

    const testRunsRoot = setupTestRunsDir([
      { timestamp: '20260215-120000', manifest: previousManifest },
    ]);

    const currentManifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [
        makeTestCase('TC-001-login', 'failed', 'timeout'),
      ],
    });

    const result = classifyFailures(currentManifest, testRunsRoot);

    expect(result.newFailures).toHaveLength(1);
    expect(result.knownFailures).toHaveLength(0);
    expect(result.newFailures[0].id).toBe('TC-001-login');
    expect(result.newFailures[0].lastPassedRun).toBe('20260215-120000');
  });

  test('failure is known when test failed in all previous runs', () => {
    const prev1 = makeManifest({
      timestamp: '20260215-120000',
      testCases: [makeTestCase('TC-001-login', 'failed', 'timeout')],
    });
    const prev2 = makeManifest({
      timestamp: '20260214-120000',
      testCases: [makeTestCase('TC-001-login', 'failed', 'timeout')],
    });

    const testRunsRoot = setupTestRunsDir([
      { timestamp: '20260215-120000', manifest: prev1 },
      { timestamp: '20260214-120000', manifest: prev2 },
    ]);

    const currentManifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [makeTestCase('TC-001-login', 'failed', 'timeout')],
    });

    const result = classifyFailures(currentManifest, testRunsRoot);

    expect(result.newFailures).toHaveLength(0);
    expect(result.knownFailures).toHaveLength(1);
    expect(result.knownFailures[0].id).toBe('TC-001-login');
  });

  test('mixed new and known failures', () => {
    const previousManifest = makeManifest({
      timestamp: '20260215-120000',
      testCases: [
        makeTestCase('TC-001-login', 'passed'),
        makeTestCase('TC-002-checkout', 'failed', 'always broken'),
      ],
    });

    const testRunsRoot = setupTestRunsDir([
      { timestamp: '20260215-120000', manifest: previousManifest },
    ]);

    const currentManifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [
        makeTestCase('TC-001-login', 'failed', 'new regression'),
        makeTestCase('TC-002-checkout', 'failed', 'still broken'),
      ],
    });

    const result = classifyFailures(currentManifest, testRunsRoot);

    expect(result.newFailures).toHaveLength(1);
    expect(result.newFailures[0].id).toBe('TC-001-login');
    expect(result.newFailures[0].lastPassedRun).toBe('20260215-120000');

    expect(result.knownFailures).toHaveLength(1);
    expect(result.knownFailures[0].id).toBe('TC-002-checkout');
  });

  test('new test not in history is treated as new failure', () => {
    const previousManifest = makeManifest({
      timestamp: '20260215-120000',
      testCases: [makeTestCase('TC-001-login', 'passed')],
    });

    const testRunsRoot = setupTestRunsDir([
      { timestamp: '20260215-120000', manifest: previousManifest },
    ]);

    const currentManifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [
        makeTestCase('TC-003-new-feature', 'failed', 'new test fails'),
      ],
    });

    const result = classifyFailures(currentManifest, testRunsRoot);

    expect(result.newFailures).toHaveLength(1);
    expect(result.newFailures[0].id).toBe('TC-003-new-feature');
    expect(result.newFailures[0].lastPassedRun).toBeNull();
  });

  test('respects BUGZY_FAILURE_LOOKBACK env var', () => {
    // Set lookback to 1
    const origEnv = process.env.BUGZY_FAILURE_LOOKBACK;
    process.env.BUGZY_FAILURE_LOOKBACK = '1';

    try {
      // Run 1: test passed
      // Run 2: test failed
      // Run 3 (current): test failed
      // With lookback=1, only run 2 is checked (most recent)
      const run1 = makeManifest({
        timestamp: '20260213-120000',
        testCases: [makeTestCase('TC-001-login', 'passed')],
      });
      const run2 = makeManifest({
        timestamp: '20260214-120000',
        testCases: [makeTestCase('TC-001-login', 'failed', 'broken')],
      });

      const testRunsRoot = setupTestRunsDir([
        { timestamp: '20260213-120000', manifest: run1 },
        { timestamp: '20260214-120000', manifest: run2 },
      ]);

      const currentManifest = makeManifest({
        timestamp: '20260215-120000',
        testCases: [makeTestCase('TC-001-login', 'failed', 'still broken')],
      });

      const result = classifyFailures(currentManifest, testRunsRoot);

      // With lookback=1, only sees run2 where test failed → known failure
      expect(result.knownFailures).toHaveLength(1);
      expect(result.newFailures).toHaveLength(0);
    } finally {
      if (origEnv !== undefined) {
        process.env.BUGZY_FAILURE_LOOKBACK = origEnv;
      } else {
        delete process.env.BUGZY_FAILURE_LOOKBACK;
      }
    }
  });

  test('handles timedOut status as failure', () => {
    const previousManifest = makeManifest({
      timestamp: '20260215-120000',
      testCases: [makeTestCase('TC-001-login', 'passed')],
    });

    const testRunsRoot = setupTestRunsDir([
      { timestamp: '20260215-120000', manifest: previousManifest },
    ]);

    const currentManifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [makeTestCase('TC-001-login', 'timedOut', 'Test timeout')],
    });

    const result = classifyFailures(currentManifest, testRunsRoot);

    expect(result.newFailures).toHaveLength(1);
    expect(result.newFailures[0].id).toBe('TC-001-login');
  });

  test('skips current run timestamp when reading previous manifests', () => {
    // Only the current run exists - should be treated as first run
    const currentManifest = makeManifest({
      timestamp: '20260216-120000',
      testCases: [makeTestCase('TC-001-login', 'failed', 'error')],
    });

    const testRunsRoot = setupTestRunsDir([
      { timestamp: '20260216-120000', manifest: currentManifest },
    ]);

    const result = classifyFailures(currentManifest, testRunsRoot);

    // First run - all failures are new
    expect(result.newFailures).toHaveLength(1);
    expect(result.knownFailures).toHaveLength(0);
  });
});
