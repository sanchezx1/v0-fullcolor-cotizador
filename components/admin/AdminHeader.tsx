'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Título */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Acción personalizada */}
        {action && <div>{action}</div>}
        {/* Notificaciones */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">AD</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">admin@fullcolor.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
