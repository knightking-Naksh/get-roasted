import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata = {
  title: 'Vibe Check | AI Roast Generator',
  description: 'Upload a photo and let our AI brutally roast your vibe, fit, and aura. Share your Vibe Score to Instagram and WhatsApp.',
  keywords: 'AI roast, vibe check, roast my photo, AI outfit rater, Centilliox',
  verification: {
    google: 'Z-QXL1ijli_rU-JOJYk1gJ8nGhdakK5y7CwyFa3P8xM',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#111a12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
