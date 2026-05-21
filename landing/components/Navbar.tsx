'use client'

import { useState } from 'react'

const APP_URL = 'https://www.budgli.com'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'FAQ',          href: '#faq' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-md border-b border-gray-100/80">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" aria-hidden="true" className="w-7 h-7 shrink-0" />
          <span className="text-[15px] font-bold text-budgli-navy tracking-tight">budgli</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3.5 py-2 rounded-lg hover:bg-gray-50"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <a
            href={APP_URL}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3.5 py-2"
          >
            Log in
          </a>
          <a
            href={APP_URL}
            className="text-sm font-semibold bg-budgli-green hover:bg-budgli-green-dark text-budgli-navy px-4 py-2 rounded-lg transition-colors shadow-sm shadow-budgli-green/20"
          >
            Get started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-5 pt-3 space-y-0.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2.5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-100 mt-2 flex flex-col gap-2">
            <a href={APP_URL} className="text-sm font-medium text-gray-500 hover:text-gray-900 text-center py-2.5 transition-colors">
              Log in
            </a>
            <a
              href={APP_URL}
              className="text-sm font-semibold bg-budgli-green hover:bg-budgli-green-dark text-budgli-navy px-4 py-3 rounded-lg transition-colors text-center shadow-sm shadow-budgli-green/20"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
