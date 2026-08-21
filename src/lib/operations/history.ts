/**
 * Undo/redo history — manages the history stack for the editor.
 *
 * This is a pure data structure (not a Zustand store) so it can be used in
 * both client-side stores and server-side operation processing.
 */
import type { Document } from '@/lib/scene-graph/schema';
import type { Operation } from './types';
import { type OperationBatch, applyBatch, undoBatch, redoBatch } from './batch';

export interface HistoryState {
  /** The current document. */
  document: Document;
  /** Undo stack (most recent batch last). */
  undoStack: OperationBatch[];
  /** Redo stack (most recent undo first). */
  redoStack: OperationBatch[];
  /** Maximum undo depth. */
  maxDepth: number;
}

export function createHistory(doc: Document, maxDepth = 100): HistoryState {
  return {
    document: doc,
    undoStack: [],
    redoStack: [],
    maxDepth,
  };
}

/**
 * Apply operations, recording them in the undo stack.
 * Clears the redo stack (new edits fork history).
 */
export function pushOperations(
  state: HistoryState,
  operations: Operation[],
  label: string,
  origin: OperationBatch['origin'] = 'manual',
): HistoryState {
  const { doc, batch } = applyBatch(state.document, operations, label, origin);

  const undoStack = [...state.undoStack, batch];
  // Trim to maxDepth
  while (undoStack.length > state.maxDepth) {
    undoStack.shift();
  }

  return {
    ...state,
    document: doc,
    undoStack,
    redoStack: [], // Clear redo on new edit
  };
}

/**
 * Undo the most recent batch.
 */
export function undo(state: HistoryState): HistoryState {
  const batch = state.undoStack[state.undoStack.length - 1];
  if (!batch) return state; // Nothing to undo

  const doc = undoBatch(state.document, batch);

  return {
    ...state,
    document: doc,
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [batch, ...state.redoStack],
  };
}

/**
 * Redo the most recently undone batch.
 */
export function redo(state: HistoryState): HistoryState {
  const batch = state.redoStack[0];
  if (!batch) return state; // Nothing to redo

  const doc = redoBatch(state.document, batch);

  return {
    ...state,
    document: doc,
    undoStack: [...state.undoStack, batch],
    redoStack: state.redoStack.slice(1),
  };
}

/** Check if undo is available. */
export function canUndo(state: HistoryState): boolean {
  return state.undoStack.length > 0;
}

/** Check if redo is available. */
export function canRedo(state: HistoryState): boolean {
  return state.redoStack.length > 0;
}
