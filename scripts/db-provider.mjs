#!/usr/bin/env node
/**
 * Rewrites the `provider` line in prisma/schema.prisma.
 *
 * The schema is deliberately written to be valid on both SQLite and PostgreSQL
 * (see the portability contract at the top of the schema), so switching
 * providers is a one-line change plus a `prisma db push`.
 *
 *   node scripts/db-provider.mjs postgresql
 *   node scripts/db-provider.mjs sqlite
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ALLOWED = new Set(['sqlite', 'postgresql']);
const target = process.argv[2];

if (!target || !ALLOWED.has(target)) {
  console.error(`Usage: node scripts/db-provider.mjs <${[...ALLOWED].join('|')}>`);
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = join(root, 'prisma', 'schema.prisma');
const original = readFileSync(schemaPath, 'utf8');

// Only touch the provider inside the `datasource db { ... }` block so the
// `generator client { provider = "prisma-client-js" }` line is left alone.
const datasourceBlock = /(datasource\s+db\s*\{[\s\S]*?\})/;
const match = original.match(datasourceBlock);
if (!match) {
  console.error('Could not locate the `datasource db { ... }` block in prisma/schema.prisma');
  process.exit(1);
}

const updatedBlock = match[1].replace(
  /provider\s*=\s*"(sqlite|postgresql|mysql|sqlserver|mongodb|cockroachdb)"/,
  `provider = "${target}"`,
);
const updated = original.replace(datasourceBlock, updatedBlock);

if (updated === original) {
  console.log(`prisma/schema.prisma already uses provider "${target}".`);
} else {
  writeFileSync(schemaPath, updated);
  console.log(`prisma/schema.prisma provider -> "${target}"`);
}

console.log('\nNext steps:');
console.log(`  1. Set DATABASE_PROVIDER=${target} and DATABASE_URL in .env`);
if (target === 'postgresql') {
  console.log('     DATABASE_URL="postgresql://user:pass@host:5432/wemotion?schema=public"');
} else {
  console.log('     DATABASE_URL="file:./prisma/dev.db"');
}
console.log('  2. npm run db:generate');
console.log('  3. npm run db:push');
