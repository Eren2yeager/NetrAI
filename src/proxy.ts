// ─────────────────────────────────────────────────────────────────────────────
// NetrAI — Role-Based Route Middleware
// Runs on every request that matches the config matcher below.
//
// Rules:
//   /cm/*       → requires role: 'cm'
//   /dept/*     → requires role: 'dept_head' or 'field_officer'
//   /login      → redirects to dashboard if already authenticated
//   /submit     → public, always allowed
//   /api/auth/* → always allowed (NextAuth internals)
//   /api/sla/*  → protected by CRON_SECRET header, not by session
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth(function middleware(req) {
  const { pathname } = req.nextUrl
  // NextAuth v5 injects req.auth — typed as Session | null
  const session = req.auth

  // ── /login — redirect authenticated users to their dashboard ──────────────
  if (pathname === '/login') {
    if (session?.user) {
      const dest =
        session.user.role === 'dept_head' || session.user.role === 'field_officer'
          ? '/dept/dashboard'
          : '/cm/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // ── /cm/* — CM only ───────────────────────────────────────────────────────
  if (pathname.startsWith('/cm')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session.user.role !== 'cm') {
      return NextResponse.redirect(new URL('/dept/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // ── /dept/* — dept_head and field_officer ─────────────────────────────────
  if (pathname.startsWith('/dept')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session.user.role !== 'dept_head' && session.user.role !== 'field_officer') {
      return NextResponse.redirect(new URL('/cm/dashboard', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

// ── Matcher ───────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    '/login',
    '/cm/:path*',
    '/dept/:path*',
  ],
}
