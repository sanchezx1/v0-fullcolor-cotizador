'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/supabase-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Shield, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  collapsed?: boolean
  sidebarMode?: boolean
}

export function UserMenu({ collapsed, sidebarMode = false }: UserMenuProps) {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser()
        setUserEmail(user?.email || null)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Sesión cerrada correctamente')
      router.push('/auth/login')
      router.refresh()
    } catch (error: any) {
      console.error('Error logout:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex items-center gap-3 p-2", collapsed && "justify-center")}>
        <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />
        {!collapsed && sidebarMode && (
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
            <div className="h-2 w-32 bg-white/10 rounded animate-pulse" />
          </div>
        )}
      </div>
    )
  }

  if (!userEmail) return null

  const initials = userEmail.substring(0, 2).toUpperCase()

  // Styles based on mode
  const triggerStyles = sidebarMode 
    ? "w-full hover:bg-white/10 text-white border-0 ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
    : "hover:bg-gray-100 text-gray-900"
  
  const avatarFallbackStyles = sidebarMode
    ? "bg-white text-[#0066a1] font-bold"
    : "bg-[#0066a1] text-white font-semibold"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-auto py-2 px-2 flex items-center gap-3 transition-all duration-200", 
            collapsed ? "justify-center" : "justify-start",
            triggerStyles
          )}
        >
          <Avatar className={cn("h-9 w-9 transition-transform duration-200", !collapsed && "group-hover:scale-105")}>
            <AvatarFallback className={avatarFallbackStyles}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex flex-col items-start overflow-hidden text-left flex-1 min-w-0">
               <span className={cn("text-sm font-medium truncate w-full", sidebarMode ? "text-white" : "text-gray-900")}>
                 Administrador
               </span>
               <span className={cn("text-xs truncate w-full", sidebarMode ? "text-white/70" : "text-muted-foreground")}>
                 {userEmail}
               </span>
            </div>
          )}
          
          {!collapsed && sidebarMode && (
             <ChevronRight className="h-4 w-4 text-white/50 ml-auto shrink-0" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={sidebarMode ? "start" : "end"} className="w-56" sideOffset={8}>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#0066a1]" />
              <p className="text-sm font-medium">Cuenta Activa</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
