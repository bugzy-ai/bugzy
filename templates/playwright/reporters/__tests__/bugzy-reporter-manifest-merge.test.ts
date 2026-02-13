import { test, expect } from '@playwright/test';
import { mergeManifests } from '../bugzy-reporter';

function makeExecution(overrides: Partial<{
  number: number;
  status: string;
  duration: number;
  videoFile: string | null;
  hasTrace: boolean;
  hasScreenshots: boolean;
  error: string | null;
}> = {}) {
  return {
    number: 1,
    status: 'passed',
    duration: 1000,
    videoFile: 'video.webm',
    hasTrace: false,
    hasScreenshots: false,
    error: null,
    ...overrides,
  };
}

function makeTestCase(id: string, executions: ReturnType<typeof makeExecution>[], finalStatus?: string) {
  const lastExec = executions[executions.length - 1];
  return {
    id,
    name: id.replace(/^TC-\d+-/, '').replace(/-/g, ' '),
    totalExecutions: executions.length,
    finalStatus: finalStatus ?? lastExec.status,
    executions,
  };
}

function makeManifest(overrides: Partial<{
  bugzyExecutionId: string;
  timestamp: string;
  startTime: string;
  endTime: string;
  status: string;
  stats: { totalTests: number; passed: number; failed: number; totalExecutions: number };
  testCases: ReturnType<typeof makeTestCase>[];
}> = {}) {
  const testCases = overrides.testCases ?? [];
  const totalExecutions = testCases.reduce((sum, tc) => sum + tc.executions.length, 0);
  const passed = testCases.filter(tc => tc.finalStatus === 'passed').length;
  const failed = testCases.length - passed;

  return {
    bugzyExecutionId: 'local-20260127-060129',
    timestamp: '20260127-060129',
    startTime: '2026-01-27T06:01:29.000Z',
    endTime: '2026-01-27T06:02:00.000Z',
    status: 'passed',
    stats: {
      totalTests: testCases.length,
      passed,
      failed,
      totalExecutions,
      ...overrides.stats,
    },
    ...overrides,
    testCases,
  };
}

test.describe('mergeManifests', () => {
  test('returns current manifest unchanged when existing is null', () => {
    const current = makeManifest({
      testCases: [makeTestCase('TC-001-login', [makeExecution()])],
    });

    const result = mergeManifests(null, current);

    expect(result).toEqual(current);
  });

  test('merges test cases from both manifests', () => {
    const existing = makeManifest({
      testCases: [
        makeTestCase('TC-001-login', [makeExecution({ number: 1 })]),
      ],
    });

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-002-checkout', [makeExecution({ number: 1 })]),
      ],
    });

    const result = mergeManifests(existing, current);

    expect(result.testCases).toHaveLength(2);
    expect(result.testCases.map(tc => tc.id)).toContain('TC-001-login');
    expect(result.testCases.map(tc => tc.id)).toContain('TC-002-checkout');
    expect(result.stats.totalTests).toBe(2);
    expect(result.stats.totalExecutions).toBe(2);
  });

  test('merges executions for the same test case across runs', () => {
    const existing = makeManifest({
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 1, status: 'failed', error: 'timeout' }),
        ], 'failed'),
      ],
    });

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 2, status: 'passed' }),
        ]),
      ],
    });

    const result = mergeManifests(existing, current);

    expect(result.testCases).toHaveLength(1);
    const tc = result.testCases[0];
    expect(tc.executions).toHaveLength(2);
    expect(tc.executions[0].number).toBe(1);
    expect(tc.executions[0].status).toBe('failed');
    expect(tc.executions[1].number).toBe(2);
    expect(tc.executions[1].status).toBe('passed');
    expect(tc.totalExecutions).toBe(2);
    expect(tc.finalStatus).toBe('passed'); // Latest execution status
  });

  test('current run wins on execution number collision', () => {
    const existing = makeManifest({
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 3, status: 'failed', duration: 500 }),
        ], 'failed'),
      ],
    });

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 3, status: 'passed', duration: 1200 }),
        ]),
      ],
    });

    const result = mergeManifests(existing, current);

    const tc = result.testCases[0];
    expect(tc.executions).toHaveLength(1);
    expect(tc.executions[0].status).toBe('passed');
    expect(tc.executions[0].duration).toBe(1200);
  });

  test('preserves test cases that only exist in existing manifest', () => {
    const existing = makeManifest({
      testCases: [
        makeTestCase('TC-001-login', [makeExecution({ number: 1 })]),
        makeTestCase('TC-002-checkout', [makeExecution({ number: 1 })]),
      ],
    });

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-001-login', [makeExecution({ number: 2 })]),
      ],
    });

    const result = mergeManifests(existing, current);

    expect(result.testCases).toHaveLength(2);
    const checkout = result.testCases.find(tc => tc.id === 'TC-002-checkout');
    expect(checkout).toBeDefined();
    expect(checkout!.executions).toHaveLength(1);
    expect(checkout!.executions[0].number).toBe(1);
  });

  test('recalculates stats correctly from merged data', () => {
    const existing = makeManifest({
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 1, status: 'failed' }),
        ], 'failed'),
        makeTestCase('TC-002-checkout', [
          makeExecution({ number: 1, status: 'passed' }),
        ]),
      ],
    });

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 2, status: 'passed' }),
        ]),
        makeTestCase('TC-003-profile', [
          makeExecution({ number: 1, status: 'failed' }),
        ], 'failed'),
      ],
    });

    const result = mergeManifests(existing, current);

    expect(result.stats.totalTests).toBe(3);
    // TC-001: exec-1 (failed) + exec-2 (passed) = 2 execs, finalStatus=passed
    // TC-002: exec-1 (passed) = 1 exec, finalStatus=passed
    // TC-003: exec-1 (failed) = 1 exec, finalStatus=failed
    expect(result.stats.totalExecutions).toBe(4);
    expect(result.stats.passed).toBe(2); // TC-001 and TC-002
    expect(result.stats.failed).toBe(1); // TC-003
  });

  test('uses earliest startTime and latest endTime', () => {
    const existing = makeManifest({
      startTime: '2026-01-27T06:01:00.000Z',
      endTime: '2026-01-27T06:02:00.000Z',
      testCases: [makeTestCase('TC-001-login', [makeExecution()])],
    });

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [makeTestCase('TC-001-login', [makeExecution({ number: 2 })])],
    });

    const result = mergeManifests(existing, current);

    expect(result.startTime).toBe('2026-01-27T06:01:00.000Z');
    expect(result.endTime).toBe('2026-01-27T06:06:00.000Z');
  });

  test('sets status to failed if any test case has failed finalStatus', () => {
    const existing = makeManifest({
      status: 'passed',
      testCases: [
        makeTestCase('TC-001-login', [makeExecution({ number: 1, status: 'passed' })]),
      ],
    });

    const current = makeManifest({
      status: 'passed',
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-002-checkout', [
          makeExecution({ number: 1, status: 'failed' }),
        ], 'failed'),
      ],
    });

    const result = mergeManifests(existing, current);

    expect(result.status).toBe('failed');
  });

  test('preserves original session timestamp from existing manifest', () => {
    const existing = makeManifest({
      timestamp: '20260127-060129',
      testCases: [makeTestCase('TC-001-login', [makeExecution()])],
    });

    const current = makeManifest({
      timestamp: '20260127-060500',
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [makeTestCase('TC-001-login', [makeExecution({ number: 2 })])],
    });

    const result = mergeManifests(existing, current);

    expect(result.timestamp).toBe('20260127-060129');
  });

  test('handles timedOut status as failure in merged status', () => {
    const existing = makeManifest({
      status: 'passed',
      testCases: [
        makeTestCase('TC-001-login', [
          makeExecution({ number: 1, status: 'timedOut' }),
        ], 'timedOut'),
      ],
    });

    const current = makeManifest({
      status: 'passed',
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-002-checkout', [makeExecution({ number: 1 })]),
      ],
    });

    const result = mergeManifests(existing, current);

    expect(result.status).toBe('failed');
  });

  test('does not mutate input manifests', () => {
    const existingExec = makeExecution({ number: 1, status: 'failed' });
    const existing = makeManifest({
      testCases: [makeTestCase('TC-001-login', [existingExec], 'failed')],
    });
    const existingSnapshot = JSON.parse(JSON.stringify(existing));

    const current = makeManifest({
      startTime: '2026-01-27T06:05:00.000Z',
      endTime: '2026-01-27T06:06:00.000Z',
      testCases: [
        makeTestCase('TC-001-login', [makeExecution({ number: 2, status: 'passed' })]),
      ],
    });
    const currentSnapshot = JSON.parse(JSON.stringify(current));

    mergeManifests(existing, current);

    expect(existing).toEqual(existingSnapshot);
    expect(current).toEqual(currentSnapshot);
  });
});
