import { PrismaClient } from '@prisma/client';
import { config } from '@/lib/config';

/**
 * Single Prisma client for the process.
 *
 * Next.js hot-reloads modules in development, which would otherwise create a new
 * pool on every edit until the database refuses connections. Stashing the client
 * on `globalThis` keeps exactly one instance alive across reloads.
 */
const globalForPrisma = globalThis as unknown as { __wemotionPrisma?: PrismaClient };

function createClient(): PrismaClient {
  const cfg = config();
  return new PrismaClient({
    log: cfg.isProduction ? ['warn', 'error'] : ['warn', 'error'],
    datasources: { db: { url: cfg.DATABASE_URL } },
  });
}

export const db: PrismaClient = globalForPrisma.__wemotionPrisma ?? createClient();

if (!config().isProduction) {
  globalForPrisma.__wemotionPrisma = db;
}

/**
 * Serialize a value into a JSON column (stored as TEXT for provider portability).
 * `undefined` becomes `null`-ish empty so columns are never written as the
 * literal string "undefined".
 */
export function toJson(value: unknown): string {
  if (value === undefined) return 'null';
  return JSON.stringify(value);
}

/**
 * Parse a JSON text column. Returns `fallback` on absent or corrupt data rather
 * than throwing, because a single unreadable metadata blob must not take down a
 * whole project listing.
 */
export function fromJson<T>(raw: string | null | undefined, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

/**
 * Parse a JSON text column through a Zod-style validator. Unlike `fromJson`
 * this also rejects structurally valid JSON that does not match the schema,
 * which matters for the scene graph where a silently-wrong shape would surface
 * much later as a render failure.
 */
export function fromJsonValidated<T>(
  raw: string | null | undefined,
  parse: (input: unknown) => T,
  fallback: T,
): T {
  if (!raw) return fallback;
  try {
    return parse(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

/**
 * Run `fn` inside a transaction with sensible timeouts.
 *
 * SQLite serializes writers, so long interactive transactions are a real
 * contention risk; we keep the window tight and let callers retry.
 */
export async function transaction<T>(
  fn: (tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  return db.$transaction(fn, { maxWait: 8_000, timeout: 30_000 });
}

/**
 * SQLite returns `SQLITE_BUSY` when two writers collide. Every write path that
 * can run concurrently (queue claiming, autosave, operation append) goes through
 * this helper so a transient lock retries instead of surfacing as a 500.
 */
export async function withWriteRetry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable =
        message.includes('SQLITE_BUSY') ||
        message.includes('database is locked') ||
        message.includes('deadlock detected') ||
        message.includes('could not serialize access');
      if (!retryable || i === attempts - 1) throw error;
      // Exponential backoff with jitter, capped so a hot row cannot stall a request.
      const delay = Math.min(400, 25 * 2 ** i) + Math.random() * 25;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

let pragmasApplied = false;

/**
 * Apply SQLite pragmas that make concurrent access viable: WAL for
 * reader/writer parallelism and a busy timeout so short collisions block briefly
 * instead of failing immediately. No-op on PostgreSQL.
 */
export async function ensureDatabaseReady(): Promise<void> {
  if (pragmasApplied) return;
  pragmasApplied = true;
  if (config().DATABASE_PROVIDER !== 'sqlite') return;
  try {
    await db.$executeRawUnsafe('PRAGMA journal_mode = WAL;');
    await db.$executeRawUnsafe('PRAGMA busy_timeout = 5000;');
    await db.$executeRawUnsafe('PRAGMA synchronous = NORMAL;');
    await db.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  } catch {
    // A read-only or already-configured database is not a startup failure.
  }
}
