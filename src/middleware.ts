import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Allow update-password page always (password recovery flow)
  if (path === '/update-password') {
    return response
  }

  // If logged in and visiting login/register/landing → go straight to dashboard
  // (Onboarding is optional — user can set up currency/logo from Settings later)
  if (user && (path === '/' || path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If not logged in and visiting protected pages → redirect to login
  if (!user && (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/settings') || path.startsWith('/onboarding') || path.startsWith('/quotations') || path.startsWith('/trash'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/', '/login', '/register', '/dashboard/:path*', '/admin/:path*', '/settings/:path*', '/onboarding/:path*', '/update-password', '/quotations/:path*', '/trash/:path*'],
}
