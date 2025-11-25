"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, History, UserPlus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExistingEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: () => void
  onContinueAsGuest: () => void
}

export function ExistingEmailDialog({ 
  open, 
  onOpenChange, 
  onLogin, 
  onContinueAsGuest 
}: ExistingEmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        {/* Header Section with Gradient Background */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-6 border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                ¡Ya te conocemos!
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                Hemos detectado que ya has cotizado con este correo anteriormente.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Benefits Card */}
          <div className="bg-muted/40 border border-border/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserPlus className="w-4 h-4 text-primary" />
              <span>Al crear tu cuenta podrás:</span>
            </div>
            <ul className="space-y-3">
              {[
                "Guardar tus datos y cotizar más rápido",
                "Ver historial y seguimiento de pedidos",
                "Reutilizar tu información en el futuro"
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={onLogin} 
              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" 
              size="lg"
            >
              Crear cuenta y vincular cotizaciones
              <ArrowRight className="w-4 h-4 ml-2" />
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
              onClick={onContinueAsGuest} 
              variant="outline" 
              className="w-full h-11 border-border/60 hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              Continuar como invitado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
