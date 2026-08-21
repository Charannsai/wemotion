/**
 * Centralized, validated environment configuration.
 *
 * Every module reads configuration from here rather than touching
 * `process.env` directly, so that (a) defaults live in one place, (b) a missing
 * required secret fails loudly at boot instead of at first use, and (c) the
 * client bundle can never accidentally close over a server secret.
 */
import { z } from 'zod';

const bool = (dflt: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? dflt : v === 'true' || v === '1'));

const int = (dflt: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? dflt : Number.parseInt(v, 10)))
    .pipe(z.number().int().finite());

const float = (dflt: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? dflt : Number.parseFloat(v)))
    .pipe(z.number().finite());

const str = (dflt: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? dflt : v));

const optionalStr = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v.trim() === '' ? undefined : v.trim()));

const schema = z.object({
  NODE_ENV: str('development').pipe(z.enum(['development', 'test', 'production'])),
  APP_URL: str('http://localhost:3000'),

  DATABASE_PROVIDER: str('sqlite').pipe(z.enum(['sqlite', 'postgresql'])),
  DATABASE_URL: str('file:./prisma/dev.db'),

  AUTH_SECRET: optionalStr,
  AUTH_SESSION_TTL: int(60 * 60 * 24 * 30),
  AUTH_DISABLE_SIGNUP: bool(false),

  STORAGE_DRIVER: str('local').pipe(z.enum(['local', 's3'])),
  STORAGE_LOCAL_ROOT: str('./storage'),
  STORAGE_SIGNING_SECRET: optionalStr,
  STORAGE_URL_TTL: int(3600),
  S3_ENDPOINT: optionalStr,
  S3_REGION: str('auto'),
  S3_BUCKET: optionalStr,
  S3_ACCESS_KEY_ID: optionalStr,
  S3_SECRET_ACCESS_KEY: optionalStr,
  S3_FORCE_PATH_STYLE: bool(true),
  S3_PUBLIC_BASE_URL: optionalStr,

  QUEUE_DRIVER: str('db').pipe(z.enum(['db', 'redis'])),
  REDIS_URL: str('redis://127.0.0.1:6379'),
  WORKER_INLINE: bool(true),
  WORKER_CONCURRENCY: int(3),
  WORKER_POLL_INTERVAL_MS: int(1000),

  INGEST_WEB_DRIVER: str('auto').pipe(z.enum(['auto', 'firecrawl', 'native'])),
  FIRECRAWL_API_KEY: optionalStr,
  FIRECRAWL_API_URL: str('https://api.firecrawl.dev'),
  FIRECRAWL_ZERO_DATA_RETENTION: bool(false),
  FIRECRAWL_MAX_AGE_MS: int(172_800_000),
  INGEST_MAX_PAGES: int(40),
  INGEST_MAX_CONCURRENCY: int(4),
  INGEST_REQUEST_TIMEOUT_MS: int(30_000),
  INGEST_RESPECT_ROBOTS: bool(true),
  INGEST_USER_AGENT: str('WeMotionBot/1.0 (+https://wemotion.app/bot)'),

  CAPTURE_ENABLED: bool(true),
  CAPTURE_TIMEOUT_MS: int(45_000),
  CAPTURE_VIEWPORT_WIDTH: int(1440),
  CAPTURE_VIEWPORT_HEIGHT: int(900),
  CAPTURE_DEVICE_SCALE: float(2),

  GROQ_API_KEY: optionalStr,
  AI_MODEL_DIRECTOR: str('llama-3.3-70b-versatile'),
  AI_MODEL_FAST: str('llama-3.1-8b-instant'),
  AI_MAX_OUTPUT_TOKENS: int(8192),
  AI_MAX_RETRIES: int(3),
  AI_REQUEST_TIMEOUT_MS: int(180_000),

  RENDER_DRIVER: str('chromium').pipe(z.enum(['chromium', 'remotion'])),
  FFMPEG_PATH: str('ffmpeg'),
  FFPROBE_PATH: str('ffprobe'),
  RENDER_TMP_DIR: str('./.render-tmp'),
  RENDER_MAX_CONCURRENCY: int(1),
  RENDER_FRAME_CONCURRENCY: int(4),
  RENDER_MAX_DURATION_SECONDS: int(300),
  RENDER_KEEP_FRAMES: bool(false),

  PLAN_DEFAULT: str('creator'),
});

export type ServerConfig = z.infer<typeof schema> & {
  /** True when a real Groq API key is present; otherwise the deterministic planner runs. */
  aiEnabled: boolean;
  /** Which web-ingestion driver will actually be used after resolving `auto`. */
  resolvedWebDriver: 'firecrawl' | 'native';
  isProduction: boolean;
};

let cached: ServerConfig | null = null;

function derive(parsed: z.infer<typeof schema>): ServerConfig {
  const aiEnabled = Boolean(parsed.GROQ_API_KEY);
  const resolvedWebDriver: 'firecrawl' | 'native' =
    parsed.INGEST_WEB_DRIVER === 'firecrawl'
      ? 'firecrawl'
      : parsed.INGEST_WEB_DRIVER === 'native'
        ? 'native'
        : parsed.FIRECRAWL_API_KEY
          ? 'firecrawl'
          : 'native';

  return {
    ...parsed,
    aiEnabled,
    resolvedWebDriver,
    isProduction: parsed.NODE_ENV === 'production',
  };
}

/**
 * Reads and validates server configuration. Safe to call from anywhere on the
 * server; throws if called in the browser so a secret can never leak into a
 * client bundle by accident.
 */
export function config(): ServerConfig {
  if (typeof window !== 'undefined') {
    throw new Error('config() is server-only. Import from @/lib/public-config in client code.');
  }
  if (cached) return cached;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${detail}`);
  }

  const cfg = derive(parsed.data);

  // Secrets that have no safe default. In development we derive a stable
  // fallback from the database URL so `npm run dev` works on a fresh clone, but
  // production must supply real values.
  if (!cfg.AUTH_SECRET) {
    if (cfg.isProduction) {
      throw new Error(
        'AUTH_SECRET is required in production. Generate one with:\n' +
          '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
      );
    }
    cfg.AUTH_SECRET = `dev-insecure-auth-secret::${cfg.DATABASE_URL}`;
  }
  if (!cfg.STORAGE_SIGNING_SECRET) {
    if (cfg.isProduction) {
      throw new Error('STORAGE_SIGNING_SECRET is required in production.');
    }
    cfg.STORAGE_SIGNING_SECRET = `dev-insecure-storage-secret::${cfg.DATABASE_URL}`;
  }
  if (cfg.STORAGE_DRIVER === 's3') {
    const missing = (['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const).filter(
      (k) => !cfg[k],
    );
    if (missing.length) {
      throw new Error(`STORAGE_DRIVER=s3 requires: ${missing.join(', ')}`);
    }
  }
  if (cfg.INGEST_WEB_DRIVER === 'firecrawl' && !cfg.FIRECRAWL_API_KEY) {
    throw new Error('INGEST_WEB_DRIVER=firecrawl requires FIRECRAWL_API_KEY.');
  }

  cached = cfg;
  return cfg;
}

/** Test/CLI helper — forget the memoized config after mutating process.env. */
export function resetConfigCache(): void {
  cached = null;
}
