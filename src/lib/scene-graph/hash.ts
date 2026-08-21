/**
 * Deterministic document hashing.
 *
 * The hash is used to detect no-op saves and to verify render determinism:
 * identical documents must always produce the same hash regardless of
 * property insertion order in the JSON.
 */
import { createHash } from 'node:crypto';
import type { Document } from './schema';

/**
 * Produce a deterministic JSON string. Object keys are sorted recursively
 * so the output is independent of insertion order.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(val as Record<string, unknown>).sort()) {
        sorted[k] = (val as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return val;
  });
}

/** SHA-256 hex digest of the canonical JSON representation of a document. */
export function hashDocument(doc: Document): string {
  const canonical = canonicalJson(doc);
  return createHash('sha256').update(canonical, 'utf-8').digest('hex');
}

/** Byte size of the canonical JSON representation. */
export function documentBytes(doc: Document): number {
  return Buffer.byteLength(canonicalJson(doc), 'utf-8');
}
