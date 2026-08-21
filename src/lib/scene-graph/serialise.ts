/**
 * Serialisation / deserialisation of the scene-graph document.
 *
 * All reads from the database go through `deserialiseDocument` which validates
 * through Zod and fills in defaults. All writes go through `serialiseDocument`
 * which produces canonical JSON for deterministic hashing.
 */
import { DocumentSchema, type Document } from './schema';
import { canonicalJson } from './hash';

/**
 * Serialise a Document to a JSON string suitable for database storage.
 * Uses canonical key ordering for deterministic hashing.
 */
export function serialiseDocument(doc: Document): string {
  return canonicalJson(doc);
}

/**
 * Deserialise a JSON string into a validated Document.
 * Returns a fully-defaulted Document — any missing optional fields are filled
 * in by the Zod schema defaults.
 *
 * @throws {Error} if the JSON is unparseable or structurally invalid.
 */
export function deserialiseDocument(json: string): Document {
  const raw = JSON.parse(json);
  return DocumentSchema.parse(raw);
}

/**
 * Safe variant that returns a fallback document on failure instead of throwing.
 */
export function deserialiseDocumentSafe(json: string | null | undefined, fallback: Document): Document {
  if (!json) return fallback;
  try {
    return deserialiseDocument(json);
  } catch {
    return fallback;
  }
}
