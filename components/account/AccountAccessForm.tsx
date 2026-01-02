'use client'

import { useMemo, useState } from "react"
import { Mail, Sparkles } from "lucide-react"
import { supabase } from "@/src/services/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface AccountAccessFormProps {
  defaultEmail?: string
  title?: string
  description?: string
  ctaLabel?: string
  onSuccess?: () => void
}

export function AccountAccessForm({
  defaultEmail = "",
  title = "Accede a tu cuenta",
  description = "Usa tu correo y te enviaremos un enlace seguro para continuar.",
  ctaLabel = "Enviar enlace de acceso",
  onSuccess,
}: AccountAccessFormProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined
    return `${window.location.origin}/mi-cuenta`
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Ingresa un correo para continuar")
      return
    }

    setSending(true)
    setSent(false)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        throw error
      }

      setSent(true)
      toast.success("Enlace enviado", {
        description: "Revisa tu bandeja y sigue el enlace para acceder a Mi cuenta.",
      })
      onSuccess?.()
    } catch (error) {
      console.error("Error enviando enlace de acceso:", error)
      const message = error instanceof Error ? error.message : "No se pudo enviar el enlace de acceso"
      toast.error("No se pudo enviar el enlace", {
        description: message,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold text-foreground">{title}</Label>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-email" className="text-sm font-medium">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="account-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            className="pl-10"
            disabled={sending}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary text-white hover:bg-primary-hover" disabled={sending}>
        {sending ? "Enviando enlace..." : ctaLabel}
      </Button>

      <p className="text-xs text-muted-foreground">
        Recibirás un correo con un enlace de inicio de sesión. No compartimos tus datos ni mostraremos información de
        otras cuentas.
      </p>

      {sent && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Enviamos un enlace a {email}. Ábrelo en este navegador para ver tus cotizaciones.
        </div>
      )}
    </form>
  )
}
