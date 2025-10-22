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
import { LogOut, User, Shield } from 'lucide-react'
import { toast } from 'sonner'

export function UserMenu() {
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

  if (loading) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
        <Avatar>
          <AvatarFallback className="bg-gray-200">
            <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  if (!userEmail) return null

  const initials = userEmail.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-[#0066a1] transition-all">
          <Avatar>
            <AvatarFallback className="bg-[#0066a1] text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#0066a1]" />
              <p className="text-sm font-medium">Administrador</p>
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
