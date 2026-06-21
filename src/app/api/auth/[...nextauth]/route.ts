// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — NextAuth v5 Route Handler
// Delegates all /api/auth/* requests to the NextAuth handlers.
// Explicit type cast resolves the NextAuth beta / Next.js 16 type mismatch.
// ─────────────────────────────────────────────────────────────────────────────

import { handlers } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export const GET  = handlers.GET  as (req: NextRequest) => Promise<Response>
export const POST = handlers.POST as (req: NextRequest) => Promise<Response>
