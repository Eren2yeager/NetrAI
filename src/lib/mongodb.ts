// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — MongoDB Connection Singleton
// Caches the Mongoose connection on the global object so Next.js hot reload
// doesn't open a new connection on every file change in development.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is not defined. Add it to .env.local before starting the server.'
  )
}

// ── Global cache type ─────────────────────────────────────────────────────────

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Extend the Node.js global object so the cache survives hot reloads
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }
global.mongooseCache = cached

// ── Connection helper ─────────────────────────────────────────────────────────

export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection immediately
  if (cached.conn) return cached.conn

  // Reuse in-flight connection promise if one is already pending
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,  // fail fast instead of buffering when disconnected
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Reset so the next call retries the connection
    cached.promise = null
    throw err
  }

  return cached.conn
}
