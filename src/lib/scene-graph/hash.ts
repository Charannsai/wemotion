/**
 * Deterministic document hashing.
 *
 * The hash is used to detect no-op saves and to verify render determinism:
 * identical documents must always produce the same hash regardless of
 * property insertion order in the JSON.
 */

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
export async function hashDocument(doc: Document): Promise<string> {
  const canonical = canonicalJson(doc);
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Byte size of the canonical JSON representation. */
export function documentBytes(doc: Document): number {
  return new TextEncoder().encode(canonicalJson(doc)).length;
}
