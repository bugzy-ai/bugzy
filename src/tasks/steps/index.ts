/**
 * Step Library Registry
 *
 * Central registry for all task steps. Steps are atomic, reusable units
 * of work that can be composed to form complete tasks.
 */

import type { TaskStep, StepCategory } from './types';

// Setup steps
import { readKnowledgeBaseStep } from './setup/read-knowledge-base';
import { readTestStrategyStep } from './setup/read-test-strategy';
import { loadProjectContextStep } from './setup/load-project-context';
import { securityNoticeStep } from './setup/security-notice';
import { gatherDocumentationStep } from './setup/gather-documentation';

// Exploration steps
import { explorationProtocolStep } from './exploration/exploration-protocol';

// Clarification steps
import { clarificationProtocolStep } from './clarification/clarification-protocol';

// Execution steps
import { runPlaywrightTestsStep } from './execution/run-playwright-tests';
import { parseTestResultsStep } from './execution/parse-test-results';
import { triageFailuresStep } from './execution/triage-failures';
import { fixTestIssuesStep } from './execution/fix-test-issues';
import { logProductBugsStep } from './execution/log-product-bugs';
import { createExplorationTestCaseStep } from './execution/create-exploration-test-case';
import { runExplorationStep } from './execution/run-exploration';
import { processExplorationResultsStep } from './execution/process-exploration-results';

// Generation steps
import { generateTestPlanStep } from './generation/generate-test-plan';
import { generateTestCasesStep } from './generation/generate-test-cases';
import { automateTestCasesStep } from './generation/automate-test-cases';
import { extractEnvVariablesStep } from './generation/extract-env-variables';

// Communication steps
import { notifyTeamStep } from './communication/notify-team';

// Maintenance steps
import { updateKnowledgeBaseStep } from './maintenance/update-knowledge-base';
import { generateFinalReportStep } from './maintenance/generate-final-report';
import { updateExplorationArtifactsStep } from './maintenance/update-exploration-artifacts';
import { cleanupTempFilesStep } from './maintenance/cleanup-temp-files';
import { validateTestArtifactsStep } from './maintenance/validate-test-artifacts';

/**
 * Global Step Library - Single source of truth for all steps
 *
 * Steps are registered here and can be looked up by ID.
 * The key must match the step's `id` property.
 */
export const STEP_LIBRARY: Record<string, TaskStep> = {
  // Setup
  'security-notice': securityNoticeStep,
  'read-knowledge-base': readKnowledgeBaseStep,
  'read-test-strategy': readTestStrategyStep,
  'load-project-context': loadProjectContextStep,
  'gather-documentation': gatherDocumentationStep,

  // Exploration
  'exploration-protocol': explorationProtocolStep,

  // Clarification
  'clarification-protocol': clarificationProtocolStep,

  // Execution
  'run-playwright-tests': runPlaywrightTestsStep,
  'parse-test-results': parseTestResultsStep,
  'triage-failures': triageFailuresStep,
  'fix-test-issues': fixTestIssuesStep,
  'log-product-bugs': logProductBugsStep,
  'create-exploration-test-case': createExplorationTestCaseStep,
  'run-exploration': runExplorationStep,
  'process-exploration-results': processExplorationResultsStep,

  // Generation
  'generate-test-plan': generateTestPlanStep,
  'generate-test-cases': generateTestCasesStep,
  'automate-test-cases': automateTestCasesStep,
  'extract-env-variables': extractEnvVariablesStep,

  // Communication
  'notify-team': notifyTeamStep,

  // Maintenance
  'update-knowledge-base': updateKnowledgeBaseStep,
  'generate-final-report': generateFinalReportStep,
  'update-exploration-artifacts': updateExplorationArtifactsStep,
  'cleanup-temp-files': cleanupTempFilesStep,
  'validate-test-artifacts': validateTestArtifactsStep,
};

/**
 * Get a step by ID
 * @throws Error if step not found
 */
export function getStep(id: string): TaskStep {
  const step = STEP_LIBRARY[id];
  if (!step) {
    throw new Error(`Unknown step: "${id}". Available steps: ${Object.keys(STEP_LIBRARY).join(', ')}`);
  }
  return step;
}

/**
 * Check if a step exists
 */
export function hasStep(id: string): boolean {
  return id in STEP_LIBRARY;
}

/**
 * Get all step IDs
 */
export function getAllStepIds(): string[] {
  return Object.keys(STEP_LIBRARY);
}

/**
 * Get steps by category
 */
export function getStepsByCategory(category: StepCategory): TaskStep[] {
  return Object.values(STEP_LIBRARY).filter((step) => step.category === category);
}

/**
 * Get steps by tag
 */
export function getStepsByTag(tag: string): TaskStep[] {
  return Object.values(STEP_LIBRARY).filter((step) => step.tags?.includes(tag));
}

/**
 * Get steps that require a specific subagent
 */
export function getStepsRequiringSubagent(role: string): TaskStep[] {
  return Object.values(STEP_LIBRARY).filter((step) => step.requiresSubagent === role);
}

/**
 * Validate that all referenced step IDs exist
 * @throws Error if any step ID is invalid
 */
export function validateStepIds(stepIds: string[]): void {
  const invalid = stepIds.filter((id) => !hasStep(id));
  if (invalid.length > 0) {
    throw new Error(`Invalid step IDs: ${invalid.join(', ')}`);
  }
}

// Re-export types
export * from './types';
