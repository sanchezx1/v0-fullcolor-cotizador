import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { checkRateLimit } from '@/src/lib/rateLimiter'

export async function middleware(request: NextRequest) {
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const path = request.nextUrl.pathname
  const method = request.method.toUpperCase()
  const shouldRateLimit =
    path.startsWith('/auth') ||
    path.startsWith('/api') ||
    (method === 'POST' && path.startsWith('/admin'))

  if (shouldRateLimit) {
    const { limited, retryAfterSeconds } = checkRateLimit(
      `${clientIp}:${method}:${path}`,
      {
        limit: method === 'GET' ? 120 : 20,
        windowMs: 60_000,
      }
    )

    if (limited) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
          'Cache-Control': 'no-store',
        },
      })
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    const message = (error as any)?.message || (error as any)?.name || "unknown"
    if (message !== "AuthSessionMissingError") {
      console.warn("Error obteniendo usuario en middleware:", error)
    }
    user = null
  }

  // Si no hay usuario y accede a admin, redirigir a login
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay usuario y accede a rutas de auth, redirigir segun rol
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    let role: string | null = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      role = profile?.role ?? null
    } catch (error) {
      console.warn('No se pudo obtener rol en middleware:', error)
    }

    const target = role === 'admin' ? '/admin' : '/mi-cuenta'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Si hay usuario pero no es admin e intenta admin, enviarlo a mi-cuenta
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    let role: string | null = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      role = profile?.role ?? null
    } catch (error) {
      console.warn('No se pudo obtener rol en middleware (protegiendo admin):', error)
    }

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/mi-cuenta', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/api/:path*']
}
