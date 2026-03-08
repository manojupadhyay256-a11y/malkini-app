import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const publicRoutes = ['/login', '/manifest.webmanifest', '/icon-192x192.png', '/icon-512x512.png', '/favicon.ico'];
    if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session?.userId) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
