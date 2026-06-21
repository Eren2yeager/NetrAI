import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'

// Inter — all UI, labels, data, body text
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

// DM Serif Display — only for the CM morning greeting headline
const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NetrAI — AI Governance Command Center',
  description:
    'See. Decide. Act. AI-powered governance command center for the Chief Minister of Delhi.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full`}
    >
      <body className="min-h-full bg-surface-50 text-ink-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
