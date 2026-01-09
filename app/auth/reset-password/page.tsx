"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updatePassword } from "@/lib/supabase-client"
import { supabase } from "@/src/services/supabaseClient"
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  // Verificar que el usuario tiene una sesión válida desde el enlace de reset
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }
    checkSession()

    // Escuchar cambios de auth (cuando el usuario llega desde el enlace del email)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("Completa todos los campos")
      return
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setPasswordReset(true)
      toast.success("Contraseña actualizada", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
      })
    } catch (error: unknown) {
      console.error("Error al actualizar contraseña:", error)
      const errorMessage = error instanceof Error ? error.message : "No se pudo actualizar la contraseña"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Estado de carga mientras verificamos la sesión
  if (isValidSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">Verificando enlace...</p>
        </div>
      </div>
    )
  }

  // Si no hay sesión válida, mostrar mensaje de error
  if (!isValidSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Enlace inválido o expirado
            </h1>
            <p className="text-sm text-slate-500">
              El enlace de recuperación ha expirado o no es válido. Por favor, solicita un nuevo
              enlace de recuperación.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full bg-primary hover:bg-primary-hover">
                Solicitar nuevo enlace
              </Button>
            </Link>

            <Link href="/auth/login">
              <Button type="button" variant="outline" className="w-full">
                Volver al login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
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
            <p className="text-2xl font-semibold">Crea una nueva contraseña</p>
            <p className="text-sm text-white/80">
              Elige una contraseña segura para proteger tu cuenta.
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
            {!passwordReset ? (
              <>
                <div className="space-y-2 text-left">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                    Nueva contraseña
                  </h1>
                  <p className="text-sm text-slate-500">
                    Ingresa tu nueva contraseña. Asegúrate de elegir una contraseña segura que no
                    hayas usado antes.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="h-11 border-slate-200 bg-white pr-10 focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Repite tu contraseña"
                        className="h-11 border-slate-200 bg-white pr-10 focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full bg-primary text-base font-semibold text-white hover:bg-primary-hover lg:h-10 lg:text-sm"
                    disabled={loading}
                  >
                    {loading ? "Actualizando..." : "Actualizar contraseña"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                    ¡Contraseña actualizada!
                  </h1>
                  <p className="text-sm text-slate-500">
                    Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu
                    nueva contraseña.
                  </p>
                </div>

                <Link href="/auth/login">
                  <Button
                    type="button"
                    className="w-full bg-primary hover:bg-primary-hover"
                    onClick={() => router.push("/auth/login")}
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
