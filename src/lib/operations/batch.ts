/**
 * Operation batching — group operations for atomic undo/redo.
 */
import type { Document } from '@/lib/scene-graph/schema';
import type { Operation } from './types';
import { applyOperation } from './apply';
import { invertOperation } from './invert';
import { validateOperation } from './validate';
import { newId, ID_PREFIXES } from '@/lib/ids';

export interface OperationEntry {
  operation: Operation;
  inverse: Operation;
}

export interface OperationBatch {
  id: string;
  label: string;
  entries: OperationEntry[];
  origin: 'manual' | 'ai' | 'template' | 'qa_fix' | 'system' | 'restore';
  timestamp: number;
}

/**
 * Create and apply a batch of operations atomically.
 *
 * All operations are validated and their inverses computed BEFORE any of them
 * are applied. If any validation fails, no operations are applied.
 *
 * @returns The new document and the batch record (for the undo stack).
 */
export function applyBatch(
  doc: Document,
  operations: Operation[],
  label: string,
  origin: OperationBatch['origin'] = 'manual',
): { doc: Document; batch: OperationBatch } {
  // Validate all operations first
  let currentDoc = doc;
  const entries: OperationEntry[] = [];

  for (const op of operations) {
    const validation = validateOperation(currentDoc, op);
    if (!validation.valid) {
      const msgs = validation.errors.map((e) => e.message).join(', ');
      throw new Error(`Operation validation failed: ${msgs}`);
    }

    // Compute inverse BEFORE applying (needs old state)
    const inverse = invertOperation(currentDoc, op);

    // Apply
    currentDoc = applyOperation(currentDoc, op);

    entries.push({ operation: op, inverse });
  }

  const batch: OperationBatch = {
    id: newId(ID_PREFIXES.batch),
    label,
    entries,
    origin,
    timestamp: Date.now(),
  };

  return { doc: currentDoc, batch };
}

/**
 * Undo a batch by applying all inverses in reverse order.
 */
export function undoBatch(doc: Document, batch: OperationBatch): Document {
  let currentDoc = doc;
  for (let i = batch.entries.length - 1; i >= 0; i--) {
    currentDoc = applyOperation(currentDoc, batch.entries[i]!.inverse);
  }
  return currentDoc;
}

/**
 * Redo a batch by applying all operations in original order.
 */
export function redoBatch(doc: Document, batch: OperationBatch): Document {
  let currentDoc = doc;
  for (const entry of batch.entries) {
    currentDoc = applyOperation(currentDoc, entry.operation);
  }
  return currentDoc;
}
