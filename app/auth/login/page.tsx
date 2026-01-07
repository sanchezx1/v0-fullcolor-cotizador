'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { signIn, signUp, supabase } from '@/lib/supabase-client'
import { ArrowLeft } from 'lucide-react'

type AuthTab = 'login' | 'register'

function AuthScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectToParam = searchParams.get('redirectTo')

  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<AuthTab>(tabParam === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupMessage, setSignupMessage] = useState<string | null>(null)

  const navigateAfterAuth = async () => {
    let role: string | null = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle<{ role: string | null }>()
        if (!profileError && profile) {
          role = profile.role ?? null
        }
      }
    } catch (error) {
      console.warn('No se pudo leer el rol tras auth:', error)
    }

    // Si es admin, SIEMPRE redirigir al panel de admin
    if (role === 'admin') {
      router.push('/admin')
      router.refresh()
      return
    }

    // Si no es admin, redirigir según el parámetro redirectTo o a Mi cuenta
    const cameFromAdmin = redirectToParam?.startsWith('/admin')
    const destination = cameFromAdmin ? '/mi-cuenta' : (redirectToParam || '/mi-cuenta')
    router.push(destination)
    router.refresh()
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      await signIn(email.trim().toLowerCase(), password)
      toast.success('Inicio de sesión exitoso')
      await navigateAfterAuth()
    } catch (error: any) {
      console.error('Error login:', error)
      let message = 'No se pudo iniciar sesión'
      if (error?.message?.includes('Invalid login credentials')) {
        message = 'Correo o password incorrecto'
      } else if (error?.message) {
        message = error.message
      }
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim() || !name.trim()) {
      toast.error('Completa todos los campos')
      return
    }

    if (password !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    setSignupMessage(null)

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/mi-cuenta` : undefined

      await signUp(email.trim().toLowerCase(), password, name.trim(), redirectTo)

      const confirmationText = `Hemos enviado un enlace a ${email.trim().toLowerCase()} para confirmar tu cuenta.`
      setSignupMessage(confirmationText)
      toast.success('Revisa tu correo', {
        description: 'Abre el enlace para confirmar tu cuenta y entrar a Mi cuenta.',
      })
    } catch (error: any) {
      console.error('Error registro:', error)

      // Manejar error de email duplicado específicamente
      if (error?.name === 'UserAlreadyExists') {
        toast.error('Este correo ya está registrado', {
          description: 'Si ya tienes una cuenta, inicia sesión. Si olvidaste tu contraseña, recupérala desde el login.',
        })
        // Cambiar a la pestaña de login automáticamente
        setTimeout(() => {
          setActiveTab('login')
          setEmail(email.trim().toLowerCase())
        }, 2000)
      } else {
        const message = error?.message || 'No se pudo crear la cuenta'
        toast.error(message)
      }
    } finally {
      setLoading(false)


    }
  }

  return (
    <div className="flex w-full flex-col bg-transparent lg:h-screen lg:max-h-screen lg:w-screen lg:flex-row lg:overflow-hidden lg:bg-white">
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
            <p className="text-2xl font-semibold">Cotiza, guarda y retoma tus proyectos cuando quieras.</p>
            <p className="text-sm text-white/80">
              Ahorra tiempo con tu cuenta FullColor y sigue el estado de cada cotización en un solo lugar.
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center rounded-2xl bg-white/95 px-6 py-8 shadow-xl backdrop-blur-sm sm:px-10 lg:w-1/2 lg:flex-1 lg:rounded-none lg:bg-white lg:shadow-none lg:backdrop-blur-none">
        
        <div className="mb-6 flex items-center justify-between lg:mb-12">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="hidden items-center gap-2 text-primary hover:text-primary-hover lg:flex"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al inicio
            </Link>
          </Button>
          <div className="hidden text-sm font-medium text-slate-500 lg:block">Mi cuenta</div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-8 lg:max-w-md">
            <div className="space-y-2 text-left">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                {activeTab === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
              </h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'login'
                  ? 'Ingresa tu correo abajo para acceder a tu cuenta'
                  : 'Ingresa tus datos abajo para crear tu cuenta'}
              </p>
            </div>

            <div className="space-y-6">
              {activeTab === 'login' ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="m@example.com"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                      <Link href="#" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-11 w-full bg-primary text-base font-semibold text-white hover:bg-primary-hover lg:h-10 lg:text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Iniciar sesión'}
                  </Button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium">Nombre</Label>
                    <Input
                      id="register-name"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Tu nombre"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="m@example.com"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password-confirm" className="text-sm font-medium">Confirmar password</Label>
                    <Input
                      id="register-password-confirm"
                      type="password"
                      required
                      value={passwordConfirm}
                      onChange={(event) => setPasswordConfirm(event.target.value)}
                      placeholder="********"
                      className="h-11 border-slate-200 bg-white focus-visible:border-primary focus-visible:ring-primary lg:h-10"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-11 w-full bg-primary text-base font-semibold text-white hover:bg-primary-hover lg:h-10 lg:text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                  {signupMessage && (
                    <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                      {signupMessage}
                    </div>
                  )}
                </form>
              )}

              <div className="text-center text-sm text-muted-foreground">
                {activeTab === 'login' ? (
                  <>
                    ¿No tienes una cuenta?{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      className="font-medium text-slate-900 decoration-slate-900 underline-offset-4 hover:underline focus:outline-none"
                    >
                      Regístrate
                    </button>
                  </>
                ) : (
                  <>
                    ¿Ya tienes una cuenta?{' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="font-medium text-slate-900 decoration-slate-900 underline-offset-4 hover:underline focus:outline-none"
                    >
                      Inicia sesión
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-white to-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      }
    >
      <AuthScreen />
    </Suspense>
  )
}
