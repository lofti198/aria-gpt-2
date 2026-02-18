import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "../library/auth0";

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  // If the request is for an auth route, let Auth0 handle it
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authResponse;
  }

  // Check if there's an active session
  let session;
  try {
    session = await auth0.getSession(request);
  } catch {
    // Stale/invalid session cookie — clear it and redirect to login
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("__session");
    response.cookies.delete("appSession");
    return response;
  }

  // If no active session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
};
