/**
 * String-enum contracts.
 *
 * The Prisma schema uses plain `String` columns for enum-like fields so a single
 * schema file works on both SQLite and PostgreSQL. The type safety those native
 * enums would have given us is recovered here: every such column has a `const`
 * tuple (runtime validation + exhaustive `switch`) and a derived union type.
 *
 * Anything crossing the API boundary is parsed through the matching Zod enum in
 * `src/lib/api/schemas.ts`, so a malformed value can never reach the database.
 */

const tuple = <T extends readonly string[]>(...v: T) => v;

// --- identity / access -----------------------------------------------------

export const WORKSPACE_ROLES = tuple('owner', 'admin', 'editor', 'reviewer', 'viewer');
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

/** Capability ranking; higher index = strictly more capable. */
const ROLE_RANK: Record<WorkspaceRole, number> = {
  viewer: 0,
  reviewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

export function roleAtLeast(role: string, required: WorkspaceRole): boolean {
  const r = ROLE_RANK[role as WorkspaceRole];
  return r !== undefined && r >= ROLE_RANK[required];
}

export const PLANS = tuple('free', 'creator', 'pro', 'team', 'business');
export type Plan = (typeof PLANS)[number];

// --- projects --------------------------------------------------------------

export const PROJECT_STATUSES = tuple(
  'draft',
  'ingesting',
  'planning',
  'ready',
  'in_review',
  'approved',
  'exported',
  'archived',
);
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const REVIEW_STATES = tuple('draft', 'in_review', 'approved', 'exported');
export type ReviewState = (typeof REVIEW_STATES)[number];

export const VERSION_KINDS = tuple(
  'autosave',
  'checkpoint',
  'pre_ai',
  'post_ai',
  'pre_render',
  'restore',
);
export type VersionKind = (typeof VERSION_KINDS)[number];

export const OPERATION_ORIGINS = tuple('manual', 'ai', 'template', 'qa_fix', 'system', 'restore');
export type OperationOrigin = (typeof OPERATION_ORIGINS)[number];

export const AI_INTENTS = tuple(
  'treatment',
  'scenes',
  'edit',
  'qa_fix',
  'duration',
  'aspect',
  'copy',
);
export type AiIntent = (typeof AI_INTENTS)[number];

export const AI_TX_STATUSES = tuple('proposed', 'applied', 'rejected', 'reverted', 'failed');
export type AiTxStatus = (typeof AI_TX_STATUSES)[number];

// --- ingestion -------------------------------------------------------------

export const SOURCE_KINDS = tuple('url', 'file', 'manual', 'capture');
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const SOURCE_PURPOSES = tuple(
  'home',
  'product',
  'features',
  'pricing',
  'docs',
  'integrations',
  'use_case',
  'about',
  'changelog',
  'blog',
  'demo',
  'legal',
  'other',
);
export type SourcePurpose = (typeof SOURCE_PURPOSES)[number];

/**
 * Crawl priority per page purpose (PRD §5: "Prioritize product, features,
 * pricing, docs, integrations, use-case, about, changelog, and product-demo
 * pages."). Higher wins when the page budget is exhausted.
 */
export const PURPOSE_PRIORITY: Record<SourcePurpose, number> = {
  home: 100,
  product: 95,
  features: 90,
  demo: 85,
  pricing: 80,
  use_case: 72,
  docs: 68,
  integrations: 60,
  changelog: 52,
  about: 48,
  blog: 20,
  legal: 5,
  other: 30,
};

export const SOURCE_STATUSES = tuple('pending', 'fetching', 'parsed', 'failed', 'skipped', 'excluded');
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const RENDER_PROFILES = tuple('static', 'client', 'auth', 'interactive');
export type RenderProfile = (typeof RENDER_PROFILES)[number];

export const INGEST_DRIVERS = tuple('firecrawl', 'native', 'upload');
export type IngestDriver = (typeof INGEST_DRIVERS)[number];

// --- assets ----------------------------------------------------------------

export const ASSET_KINDS = tuple(
  'image',
  'svg',
  'screenshot',
  'video',
  'audio',
  'font',
  'document',
  'lottie',
);
export type AssetKind = (typeof ASSET_KINDS)[number];

export const VISUAL_ROLES = tuple(
  'logo',
  'icon',
  'screenshot',
  'hero',
  'product_ui',
  'decorative',
  'background',
  'document',
  'audio',
  'video',
  'unknown',
);
export type VisualRole = (typeof VISUAL_ROLES)[number];

/** Roles that count as authentic product imagery for the authenticity guardrail. */
export const AUTHENTIC_PRODUCT_ROLES: readonly VisualRole[] = ['screenshot', 'product_ui', 'hero'];

export const ASSET_VARIANT_KINDS = tuple(
  'thumbnail',
  'proxy',
  'crop',
  'resize',
  'poster',
  'waveform',
);
export type AssetVariantKind = (typeof ASSET_VARIANT_KINDS)[number];

// --- knowledge -------------------------------------------------------------

export const CLAIM_CATEGORIES = tuple(
  'feature',
  'metric',
  'integration',
  'pricing',
  'security',
  'customer',
  'positioning',
  'other',
);
export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number];

export const CLAIM_STATUSES = tuple(
  'verified',
  'inferred',
  'user_provided',
  'unsupported',
  'conflicting',
);
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

/** Claim statuses that may appear in copy or narration without approval. */
export const RENDERABLE_CLAIM_STATUSES: readonly ClaimStatus[] = ['verified', 'user_provided'];

export const CHUNK_FACETS = tuple('page', 'file', 'feature', 'claim', 'terminology', 'capture');
export type ChunkFacet = (typeof CHUNK_FACETS)[number];

// --- creative --------------------------------------------------------------

export const VIDEO_CATEGORIES = tuple(
  'product_launch',
  'feature_announcement',
  'product_demo',
  'saas_explainer',
  'founder_announcement',
  'release_notes',
  'customer_story',
  'teaser',
  'pricing_overview',
  'technical_workflow',
);
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export const NARRATION_MODES = tuple('none', 'captions', 'voiceover', 'both');
export type NarrationMode = (typeof NARRATION_MODES)[number];

export const TREATMENT_STATUSES = tuple('draft', 'validated', 'rejected', 'built');
export type TreatmentStatus = (typeof TREATMENT_STATUSES)[number];

export const PRODUCERS = tuple('ai', 'deterministic', 'manual', 'template');
export type Producer = (typeof PRODUCERS)[number];

export const TEMPLATE_SCOPES = tuple('scene', 'video');
export type TemplateScope = (typeof TEMPLATE_SCOPES)[number];

// --- capture ---------------------------------------------------------------

export const CAPTURE_MODES = tuple('screenshot', 'browser_state', 'dom_aware', 'manual');
export type CaptureMode = (typeof CAPTURE_MODES)[number];

export const CAPTURE_ACTIONS = tuple(
  'initial',
  'click',
  'hover',
  'type',
  'scroll',
  'key',
  'navigate',
  'wait',
);
export type CaptureAction = (typeof CAPTURE_ACTIONS)[number];

// --- qa / render -----------------------------------------------------------

export const QA_SCOPES = tuple('structural', 'visual', 'content', 'export', 'full');
export type QaScope = (typeof QA_SCOPES)[number];

export const QA_VERDICTS = tuple('pass', 'warn', 'fail');
export type QaVerdict = (typeof QA_VERDICTS)[number];

export const RENDER_STATUSES = tuple(
  'queued',
  'preparing',
  'rendering',
  'encoding',
  'verifying',
  'completed',
  'failed',
  'cancelled',
);
export type RenderStatus = (typeof RENDER_STATUSES)[number];

export const TERMINAL_RENDER_STATUSES: readonly RenderStatus[] = [
  'completed',
  'failed',
  'cancelled',
];

export const RENDER_OUTPUT_KINDS = tuple(
  'mp4',
  'webm',
  'gif',
  'png_sequence',
  'mov',
  'srt',
  'vtt',
  'thumbnail',
);
export type RenderOutputKind = (typeof RENDER_OUTPUT_KINDS)[number];

// --- infrastructure --------------------------------------------------------

export const JOB_KINDS = tuple(
  'ingest.url',
  'ingest.file',
  'knowledge.build',
  'capture.run',
  'treatment.generate',
  'scenes.generate',
  'ai.edit',
  'qa.run',
  'render.run',
  'asset.derive',
  'thumbnail.project',
);
export type JobKind = (typeof JOB_KINDS)[number];

export const JOB_STATUSES = tuple(
  'queued',
  'claimed',
  'running',
  'completed',
  'failed',
  'cancelled',
  'dead',
);
export type JobStatus = (typeof JOB_STATUSES)[number];

export const TERMINAL_JOB_STATUSES: readonly JobStatus[] = [
  'completed',
  'failed',
  'cancelled',
  'dead',
];

export const METERS = tuple(
  'crawl_page',
  'parsed_page',
  'ai_operation',
  'rendered_second',
  'storage_byte',
  'browser_session',
  'ai_input_token',
  'ai_output_token',
);
export type Meter = (typeof METERS)[number];

export const NOTIFICATION_KINDS = tuple(
  'render_completed',
  'render_failed',
  'ingest_completed',
  'ingest_failed',
  'qa_failed',
  'comment_added',
  'approval_requested',
  'system',
);
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** Narrowing helper: `isOneOf(SOURCE_KINDS, x)` acts as a type guard. */
export function isOneOf<T extends readonly string[]>(
  allowed: T,
  value: unknown,
): value is T[number] {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/** Coerce an untrusted string to a known member, falling back to `dflt`. */
export function coerceEnum<T extends readonly string[]>(
  allowed: T,
  value: unknown,
  dflt: T[number],
): T[number] {
  return isOneOf(allowed, value) ? value : dflt;
}
