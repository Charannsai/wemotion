/**
 * QA Engine
 *
 * Runs the document against all registered rules and produces a consolidated report.
 */
import type { Document } from '@/lib/scene-graph/schema';
import type { QAContext, QARule, QAViolation } from './types';
import { structuralRules } from './rules/structural';
import { visualRules } from './rules/visual';
import { contentRules } from './rules/content';

const ALL_RULES: QARule[] = [
  ...structuralRules,
  ...visualRules,
  ...contentRules,
];

export interface QAReport {
  timestamp: number;
  totalViolations: number;
  errors: number;
  warnings: number;
  violations: QAViolation[];
}

export function runQA(doc: Document, options?: Partial<QAContext>): QAReport {
  const context: QAContext = {
    document: doc,
    constraints: options?.constraints || {},
  };

  const violations: QAViolation[] = [];

  for (const rule of ALL_RULES) {
    try {
      const results = rule.evaluate(doc, context);
      violations.push(...results);
    } catch (err) {
      console.error(`Rule ${rule.id} failed to evaluate:`, err);
    }
  }

  return {
    timestamp: Date.now(),
    totalViolations: violations.length,
    errors: violations.filter(v => v.severity === 'error').length,
    warnings: violations.filter(v => v.severity === 'warning').length,
    violations,
  };
}
