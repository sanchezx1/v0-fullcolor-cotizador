'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-6 mb-6">
      {/* Título y acción */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        
        {/* Acción personalizada */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
