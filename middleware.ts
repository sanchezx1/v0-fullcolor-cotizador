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

  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario y está intentando acceder al admin, redirigir a login
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = new URL('/auth/login', request.url)
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si hay usuario y está en login, redirigir al admin
  if (user && request.nextUrl.pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/api/:path*']
}
