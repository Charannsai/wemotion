/**
 * Identifier generation.
 *
 * All primary keys are application-generated (never database sequences) so that
 * callers can build an entire object graph — project, scenes, layers, operations
 * — in memory and persist it in one transaction, and so IDs are stable across
 * the client/server boundary during optimistic editing.
 *
 * Format: `<prefix>_<26-char base32 ULID-style>`
 *   * 48-bit millisecond timestamp prefix -> lexicographic sort == time sort,
 *     which keeps B-tree inserts sequential instead of random.
 *   * 80 bits of CSPRNG randomness -> collision-free without coordination.
 *   * Crockford base32 -> case-insensitive, no ambiguous characters, URL-safe.
 */
import { randomBytes, randomUUID } from 'node:crypto';

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32
const TIME_CHARS = 10;
const RANDOM_CHARS = 16;

export const ID_PREFIXES = {
  user: 'usr',
  session: 'ses',
  workspace: 'wsp',
  member: 'mem',
  apiKey: 'key',
  folder: 'fld',
  project: 'prj',
  version: 'ver',
  operation: 'op',
  aiTx: 'tx',
  source: 'src',
  asset: 'ast',
  variant: 'var',
  chunk: 'chk',
  claim: 'clm',
  evidence: 'evd',
  brief: 'brf',
  treatment: 'trt',
  brand: 'brd',
  template: 'tpl',
  capture: 'cap',
  state: 'cst',
  qa: 'qa',
  render: 'rnd',
  output: 'out',
  comment: 'cmt',
  share: 'shr',
  job: 'job',
  meter: 'mtr',
  usage: 'evt',
  notification: 'ntf',
  audit: 'adt',
  // Document-internal identifiers (scene graph nodes).
  scene: 'scn',
  layer: 'lyr',
  animation: 'anm',
  keyframe: 'kf',
  marker: 'mrk',
  track: 'trk',
  batch: 'bat',
  finding: 'fnd',
} as const;

export type IdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];

function encodeTime(now: number): string {
  let out = '';
  let time = now;
  for (let i = TIME_CHARS - 1; i >= 0; i--) {
    out = ENCODING[time % 32] + out;
    time = Math.floor(time / 32);
  }
  return out;
}

function encodeRandom(): string {
  // 16 base32 chars need 80 bits; draw 10 bytes and map 5-bit groups.
  const bytes = randomBytes(10);
  let bits = 0n;
  for (const byte of bytes) bits = (bits << 8n) | BigInt(byte);
  let out = '';
  for (let i = 0; i < RANDOM_CHARS; i++) {
    out = ENCODING[Number(bits & 31n)] + out;
    bits >>= 5n;
  }
  return out;
}

/** Generate a prefixed, time-sortable identifier. */
export function newId<P extends IdPrefix>(prefix: P): string {
  return `${prefix}_${encodeTime(Date.now())}${encodeRandom()}`;
}

/** Extract the creation timestamp encoded in an id, or null if unparseable. */
export function idTimestamp(id: string): Date | null {
  const body = id.includes('_') ? id.slice(id.indexOf('_') + 1) : id;
  if (body.length < TIME_CHARS) return null;
  let time = 0;
  for (let i = 0; i < TIME_CHARS; i++) {
    const index = ENCODING.indexOf(body[i]!.toUpperCase());
    if (index < 0) return null;
    time = time * 32 + index;
  }
  return new Date(time);
}

const ID_PATTERN = new RegExp(`^[a-z]{2,4}_[${ENCODING}]{${TIME_CHARS + RANDOM_CHARS}}$`);

/** Shape check for an identifier. Used to reject obviously forged path params. */
export function isValidId(id: unknown, prefix?: IdPrefix): boolean {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return false;
  if (prefix && !id.startsWith(`${prefix}_`)) return false;
  return true;
}

/** Opaque high-entropy token for share links, API keys and session cookies. */
export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** UUID for interop where an external system requires one (e.g. render worker locks). */
export function newUuid(): string {
  return randomUUID();
}

/**
 * URL-safe slug. Used for workspace and template slugs; a random suffix is
 * appended by callers when uniqueness matters.
 */
export function slugify(input: string, maxLength = 48): string {
  const base = input
    .normalize('NFKD')
    // Strip combining diacritical marks left behind by NFKD decomposition.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
  return base || 'untitled';
}
