'use client'

import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { UserMenu } from '@/components/admin/UserMenu'
import { Toaster } from '@/components/ui/sonner'
import { useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div 
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Mobile header with hamburger */}
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex-1 text-sm font-semibold text-gray-900">
            FullColor Admin
          </div>
          <UserMenu />
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex sticky top-0 z-30 h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Panel de Administración
          </h1>
          <UserMenu />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
