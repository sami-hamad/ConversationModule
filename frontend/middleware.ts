import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Mimic session behavior by using JWT tokens to check authentication state
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname, searchParams } = req.nextUrl;

    const isLoginStart = pathname.startsWith('/login');

    // Check if token (session) exists
    if (session) {
        // Check if the token has expired
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        // Ensure the session has an `exp` field and is a number
        if (session.exp && typeof session.exp === 'number') {
            const tokenExpiryTime = session.exp; // Token expiration time in seconds
            // If the token has expired, redirect to login page
            if (tokenExpiryTime < currentTime) {
                const loginUrl = req.nextUrl.clone();
                loginUrl.pathname = '/login';
                loginUrl.searchParams.set('redirect', pathname);
                // console.log('Token expired, redirecting to login');
                return NextResponse.redirect(loginUrl);
            }
        }

        // If trying to access the login page with a redirect param, redirect to the original page
        if (isLoginStart && searchParams.has('redirect')) {
            const redirectUrl = req.nextUrl.clone();
            const targetPath = searchParams.get('redirect');
            redirectUrl.pathname = targetPath || '/';
            // console.log('Redirecting authenticated user to:', targetPath);
            return NextResponse.redirect(redirectUrl);
        }

        // If authenticated and accessing the login or home page, redirect to dashboard
        if (isLoginStart) {
            const homeUrl = req.nextUrl.clone();
            homeUrl.pathname = '/';
            // console.log('Redirecting authenticated user to dashboard');
            return NextResponse.redirect(homeUrl);
        }

        // Allow authenticated users to access other pages
        return NextResponse.next();
    }

    // If the user is not authenticated (no session)
    if (!session) {
        // Allow access to the login page
        if (isLoginStart) {
            return NextResponse.next();
        }

        // Redirect unauthorized users to the login page and store the original request path
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('redirect', pathname);
        // console.log('Redirecting unauthenticated user to login with redirect:', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/chat/:path*',  // Matches dynamic chat routes
        '/',  // Home page
    ],
};
