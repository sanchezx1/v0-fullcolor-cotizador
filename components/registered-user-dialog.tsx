"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, User, ShieldAlert } from "lucide-react"

interface RegisteredUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: () => void
  onClose: () => void
}

export function RegisteredUserDialog({
  open,
  onOpenChange,
  onLogin,
  onClose
}: RegisteredUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-0 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header Section with Gradient Background */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 pb-6 border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                Inicio de sesión requerido
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                Este correo está asociado a una cuenta existente. Por seguridad, debes iniciar sesión para continuar.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Card */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span>¿Por qué debo iniciar sesión?</span>
            </div>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                <span>Para proteger tus datos personales y cotizaciones anteriores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                <span>Para acceder a tu historial y seguimiento de pedidos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                <span>Para evitar modificaciones no autorizadas de tu información</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onLogin}
              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar sesión para continuar
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O si prefieres</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-11 border-border/60 hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              Usar un correo diferente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
