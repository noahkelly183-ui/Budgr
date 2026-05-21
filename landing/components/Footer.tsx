const APP_URL = 'https://www.budgli.com'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features'     },
  { label: 'Pricing',      href: '#pricing'      },
  { label: 'FAQ',          href: '#faq'           },
  { label: 'Log in',       href: APP_URL          },
]

export default function Footer() {
  return (
    <footer className="bg-budgli-navy py-14 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Budgli" aria-hidden="true" className="w-7 h-7 shrink-0" />
              <span className="text-white font-bold text-[15px] tracking-tight">budgli</span>
            </div>
            <p className="text-white/35 text-xs leading-relaxed">
              Your personal income statement.
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-7 gap-y-2.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/45 hover:text-white/75 text-xs transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} Budgli. All rights reserved.
          </p>
          {/* Privacy Policy and Terms do not have pages yet */}
          <p className="text-white/20 text-xs">
            Privacy Policy and Terms coming before public launch.
          </p>
        </div>

      </div>
    </footer>
  )
}
