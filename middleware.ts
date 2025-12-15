import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Session çerezini al
  const session = request.cookies.get('session_user_id')
  const { pathname } = request.nextUrl

  // Kural 1: Kullanıcı giriş yapmışsa (session var)
  if (session) {
    // Eğer kullanıcı /auth ile başlayan sayfalara (sign-in, sign-up) gitmeye çalışıyorsa
    // AMA çıkış yapma (sign-out) işlemi hariç
    if (pathname.startsWith('/auth') && !pathname.startsWith('/auth/sign-out')) {
      // Onu /dashboard sayfasına yönlendir
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Kural 2: Kullanıcı giriş YAPMAMIŞSA (session yok)
  if (!session) {
    // Eğer korumalı sayfalara (/dashboard ve alt sayfaları) gitmeye çalışıyorsa
    if (pathname.startsWith('/dashboard')) {
      // Onu giriş yapma sayfasına yönlendir
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
  }

  // Diğer tüm durumlar için devam et
  return NextResponse.next()
}

// Middleware'in hangi yollarda çalışacağını belirtiyoruz
export const config = {
  matcher: [
    // Dashboard ve altındaki tüm yollar
    '/dashboard/:path*', 
    // Auth ve altındaki tüm yollar
    '/auth/:path*'
  ],
}