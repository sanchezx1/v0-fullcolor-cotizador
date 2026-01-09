"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { resetPasswordForEmail } from "@/lib/supabase-client"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error("Ingresa tu correo electrónico")
      return
    }

    setLoading(true)

    try {
      await resetPasswordForEmail(email.trim().toLowerCase())
      setEmailSent(true)
      toast.success("Correo enviado", {
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      })
    } catch (error: unknown) {
      console.error("Error al enviar email de recuperación:", error)
      const errorMessage = error instanceof Error ? error.message : "No se pudo enviar el correo"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col bg-transparent lg:h-screen lg:max-h-screen lg:w-screen lg:flex-row lg:overflow-hidden lg:bg-white">
      {/* Imagen lateral - solo en desktop */}
      <div className="relative hidden w-full lg:flex lg:w-1/2">
        <Image
          src="/herofoto1.webp"
          alt="Producción FullColor"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#001733]/80 via-[#013d68]/60 to-transparent" />
        <div className="relative z-10 flex h-full w-full flex-col justify-end p-10 text-white">
          <div className="space-y-4 text-white">
            <p className="text-2xl font-semibold">Recupera el acceso a tu cuenta</p>
            <p className="text-sm text-white/80">
              Te enviaremos un enlace seguro para restablecer tu contraseña.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex w-full flex-col justify-center rounded-2xl bg-white/95 px-6 py-8 shadow-xl backdrop-blur-sm sm:px-10 lg:w-1/2 lg:flex-1 lg:rounded-none lg:bg-white lg:shadow-none lg:backdrop-blur-none">
        <div className="mb-6 flex items-center justify-between lg:mb-12">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-2 text-primary hover:text-primary-hover"
          >
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al login
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-8 lg:max-w-md">
            {!emailSent ? (
              <>
                <div className="space-y-2 text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                    ¿Olvidaste tu contraseña?
                  </h1>
                  <p className="text-sm text-slate-500">
                    No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace para
                    restablecer tu contraseña.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="tu@email.com"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full bg-primary text-base font-semibold text-white hover:bg-primary-hover lg:h-10 lg:text-sm"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  ¿Recordaste tu contraseña?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-slate-900 decoration-slate-900 underline-offset-4 hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                    Revisa tu correo
                  </h1>
                  <p className="text-sm text-slate-500">
                    Hemos enviado un enlace de recuperación a{" "}
                    <span className="font-medium text-slate-700">{email}</span>
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> El enlace expira en 24 horas. Si no encuentras el correo,
                    revisa tu carpeta de spam.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEmailSent(false)
                      setEmail("")
                    }}
                  >
                    Enviar a otro correo
                  </Button>

                  <Link href="/auth/login">
                    <Button type="button" className="w-full bg-primary hover:bg-primary-hover">
                      Volver al login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
