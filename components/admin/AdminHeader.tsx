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
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
      {/* Título y acción */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        
        {/* Acción personalizada */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
