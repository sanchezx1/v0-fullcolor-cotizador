'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Activity, 
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { UserMenu } from './UserMenu'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Cotizaciones', href: '/admin/cotizaciones', icon: FileText },
  { name: 'Clientes', href: '/admin/leads', icon: Users },
  { name: 'Eventos', href: '/admin/eventos', icon: Activity },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
]

interface AdminSidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function AdminSidebar({ open, collapsed, onClose, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          'hidden lg:flex h-full flex-col fixed inset-y-0 z-50 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
        style={{ background: 'linear-gradient(180deg, #003d6b 0%, #0066a1 100%)' }}
      >
        {/* User Profile / Branding Area */}
        <div className={cn(
          "flex h-20 shrink-0 items-center px-2 border-b border-white/10", 
          collapsed && "justify-center"
        )}>
          <UserMenu collapsed={collapsed} sidebarMode={true} />
        </div>

        {/* Collapse button */}
        <div className="flex justify-end px-2 py-2">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5c700]"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-[#003d6b] shadow-md font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1',
                  collapsed && 'justify-center hover:translate-x-0'
                )}
                style={isActive ? { backgroundColor: '#f5c700' } : undefined}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-[#003d6b]' : 'text-white/70 group-hover:text-white'
                )} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            className={cn(
              'flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors',
              collapsed && 'justify-center'
            )}
            title={collapsed ? 'Ver Sitio' : undefined}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Ver Sitio</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div 
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #003d6b 0%, #0066a1 100%)' }}
      >
        {/* Logo & Close button */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <span className="font-bold text-xl" style={{ color: '#0066a1' }}>FC</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">FullColor</h1>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5c700]"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-8rem)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-[#003d6b] shadow-md font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                )}
                style={isActive ? { backgroundColor: '#f5c700' } : undefined}
              >
                <item.icon className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-[#003d6b]' : 'text-white/70 group-hover:text-white'
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Sitio
          </Link>
        </div>
      </div>
    </>
  )
}
