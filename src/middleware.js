import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  // ১. Login/Register পেজে আগে থেকে logged in থাকলে redirect
  if (token && (pathname === "/login" || pathname === "/register")) {
    if (role === "admin")
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    if (role === "posAdmin")
      return NextResponse.redirect(new URL("/pos/pos", request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ২. Token না থাকলে protected route এ ঢুকতে বাধা
  const protectedRoutes = ["/dashboard", "/admin-dashboard", "/pos"];
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ৩. posAdmin — শুধু /pos/* এ যেতে পারবে
  if (role === "posAdmin") {
    // /pos/pos বা /pos/* এ থাকলে আটকাবে না — allow করবে
    if (pathname.startsWith("/pos")) {
      return NextResponse.next();
    }
    // অন্য যেকোনো জায়গায় গেলে /pos/pos এ পাঠাবে
    return NextResponse.redirect(new URL("/pos/pos", request.url));
  }

  // ৪. customer — admin বা pos panel এ ঢুকতে পারবে না
  if (role === "customer") {
    if (
      pathname.startsWith("/admin-dashboard") ||
      pathname.startsWith("/pos")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ৫. admin — customer dashboard এ যেতে পারবে না
  if (role === "admin") {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin-dashboard/:path*",
    "/pos/:path*",
    "/login",
    "/register",
    "/",
  ],
};
