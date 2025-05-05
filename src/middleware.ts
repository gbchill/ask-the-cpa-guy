import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//     // Get response
//     const response = NextResponse.next();

//     // Add security headers
//     response.headers.set('X-Frame-Options', 'DENY');
//     response.headers.set('X-Content-Type-Options', 'nosniff');
//     response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
//     response.headers.set(
//         'Content-Security-Policy',
//         "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
//     );
//     response.headers.set('X-XSS-Protection', '1; mode=block');
//     response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

//     return response;
// }

// export const config = {
//     matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// };