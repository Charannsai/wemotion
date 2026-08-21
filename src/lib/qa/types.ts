/**
 * QA Rule Engine Types
 *
 * Defines the structure for structural, visual, and content quality rules.
 */
import type { Document, Scene, Layer } from '@/lib/scene-graph/schema';
import type { ResolvedLayerState } from '@/lib/motion/types';

export type ViolationSeverity = 'error' | 'warning' | 'info';

export interface QAViolation {
  ruleId: string;
  severity: ViolationSeverity;
  message: string;
  /** Context to help identify where the violation occurred */
  context: {
    sceneId?: string;
    layerId?: string;
    property?: string;
  };
  /** Optional auto-fixer hint */
  fix?: {
    type: string;
    payload: unknown;
  };
}

/**
 * Context passed to every QA rule during evaluation.
 */
export interface QAContext {
  document: Document;
  /** Optional metadata about the export/preview constraints */
  constraints: {
    targetPlatform?: 'tiktok' | 'youtube' | 'instagram' | 'linkedin';
    maxDurationFrames?: number;
  };
}

/**
 * The signature of a single QA rule evaluator.
 */
export interface QARule {
  id: string;
  name: string;
  description: string;
  category: 'structural' | 'visual' | 'content';
  /**
   * Evaluates the document. Returns an array of violations (empty if passing).
   */
  evaluate: (doc: Document, ctx: QAContext) => QAViolation[];
}
