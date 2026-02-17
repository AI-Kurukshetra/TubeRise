'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface DashboardShellProps {
  children: React.ReactNode
  email?: string | null
  role?: 'creator' | 'brand' | null
}

export default function DashboardShell({ children, email, role }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar — Sheet drawer (< lg), deferred to avoid hydration mismatch */}
      {mounted && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0 border-0 bg-white">
            <Sidebar
              email={email}
              role={role}
              onNavigate={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar — always visible (lg+) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col relative">
        <Sidebar email={email} role={role} />
        {/* Gradient right edge */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-slate-200" />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          email={email}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
          {children}
        </main>
      </div>
    </div>
  )
}
