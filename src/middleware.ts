import { NextResponse, type NextRequest } from "next/server";
// import { auth0 } from "../library/auth0"; // AUTH DISABLED

export async function middleware(request: NextRequest) {
  // AUTH DISABLED — pass all requests through
  // To re-enable, uncomment the block below and the import above
  /*
  const authResponse = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authResponse;
  }

  let session;
  try {
    session = await auth0.getSession(request);
  } catch {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("__session");
    response.cookies.delete("appSession");
    return response;
  }

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return authResponse;
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
  ],
};
