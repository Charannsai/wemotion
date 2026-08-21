/**
 * Job Queue Client (Redis / Upstash compatible)
 *
 * Provides a lightweight wrapper around Redis for enqueueing and pulling jobs.
 * Supports both Ingestion and Render background jobs.
 */
import { Redis } from 'ioredis';
import { config } from '@/lib/config';

const env = config();

const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    // Enable offline queueing during dev
    enableOfflineQueue: process.env.NODE_ENV !== 'production',
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export interface Job<T = unknown> {
  id: string;
  type: 'ingest' | 'render';
  payload: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  error?: string;
}

export async function enqueueJob<T>(type: Job['type'], payload: T): Promise<string> {
  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const job: Job<T> = {
    id,
    type,
    payload,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Store job payload in a hash
  await redis.hset(`job:${id}`, 'data', JSON.stringify(job));
  
  // Push to the queue list
  await redis.lpush(`queue:${type}`, id);
  
  return id;
}

export async function getJob<T>(id: string): Promise<Job<T> | null> {
  const data = await redis.hget(`job:${id}`, 'data');
  if (!data) return null;
  return JSON.parse(data) as Job<T>;
}

export async function updateJobStatus(id: string, status: Job['status'], error?: string): Promise<void> {
  const job = await getJob(id);
  if (!job) return;

  job.status = status;
  job.updatedAt = Date.now();
  if (error) job.error = error;

  await redis.hset(`job:${id}`, 'data', JSON.stringify(job));
}
