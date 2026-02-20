'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  email?: string | null
  role?: 'creator' | 'brand' | null
  onNavigate?: () => void
}

type NavItem = { label: string; href: string; icon: React.ReactNode }

const iconHome = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)
const iconChart = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const iconVideo = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)
const iconLink = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)
const iconMail = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const iconSearch = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)
const iconBriefcase = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const iconSettings = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const iconUser = (
  <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const commonBottom: NavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', icon: iconSettings },
  { label: 'Profile',  href: '/dashboard/profile',  icon: iconUser },
]

const creatorNav: NavItem[] = [
  { label: 'Dashboard',       href: '/dashboard',             icon: iconHome },
  { label: 'Analytics',       href: '/dashboard/analytics',   icon: iconChart },
  { label: 'Campaign Videos', href: '/dashboard/videos',      icon: iconVideo },
  { label: 'Connect YouTube', href: '/dashboard/connect',     icon: iconLink },
  { label: 'Invitations',     href: '/dashboard/invitations', icon: iconMail },
  ...commonBottom,
]

const brandNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard',          icon: iconHome },
  { label: 'Discover',  href: '/dashboard/discover', icon: iconSearch },
  { label: 'Campaigns', href: '/dashboard/campaigns', icon: iconBriefcase },
  ...commonBottom,
]

const defaultNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: iconHome },
  ...commonBottom,
]

export default function Sidebar({ email, role, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const navItems =
    role === 'creator' ? creatorNav :
    role === 'brand'   ? brandNav   :
    defaultNav

  return (
    <div className="flex flex-col h-full gradient-sidebar">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">TubeRise</span>
        </div>
      </div>

      {/* Role badge */}
      {role && (
        <div className="px-5 pt-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            role === 'creator'
              ? 'bg-pink-50 text-pink-600 ring-1 ring-pink-200'
              : 'bg-violet-50 text-violet-600 ring-1 ring-violet-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              role === 'creator' ? 'bg-pink-400' : 'bg-violet-400'
            }`} />
            {role === 'creator' ? 'Creator' : 'Brand'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm ring-1 ring-emerald-100'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
              }`}
            >
              {item.icon}
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shrink-0 flex items-center justify-center shadow-sm shadow-emerald-500/15">
            <span className="text-xs font-semibold text-white">
              {email ? email[0].toUpperCase() : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">
              {email ? email.split('@')[0] : 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">{email ?? ''}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
