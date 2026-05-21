import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://budgli.com'),

  title: 'Budgli — Your personal income statement',
  description:
    'Budgli turns your bank CSV into a clean monthly income statement. See what you earned, spent, and kept — no bank login required. Free during beta.',

  icons: {
    icon: '/logo.svg',
  },

  openGraph: {
    title: 'Budgli — Your personal income statement',
    description:
      'Budgli turns your bank CSV into a clean monthly income statement. See what you earned, spent, and kept — no bank login required. Free during beta.',
    type: 'website',
    url: 'https://budgli.com',
    images: [
      {
        url: '/dashboard.png',
        width: 1434,
        height: 751,
        alt: 'Budgli monthly dashboard — personal income statement, spending breakdown, and performance score',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Budgli — Your personal income statement',
    description:
      'Budgli turns your bank CSV into a clean monthly income statement. See what you earned, spent, and kept — no bank login required. Free during beta.',
    images: ['/dashboard.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
