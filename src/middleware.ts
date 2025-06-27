import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          (pathname.startsWith('/api') && 
                           !pathname.startsWith('/api/auth'))
  
  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Redirect authenticated users away from auth page
  if (pathname === '/auth' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - widget (public widget endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|widget).*)',
  ],
}