import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  // ১. অথেন্টিকেশন চেক: টোকেন না থাকলে প্রোটেক্টড রুটে ঢুকতে বাধা দিন
  const protectedRoutes = ["/dashboard", "/admin-dashboard", "/pos"];
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ২. posAdmin এর জন্য অ্যাক্সেস কন্ট্রোল
  if (role === "posAdmin") {
    // সে যদি হোমপেজ, সাধারণ ড্যাশবোর্ড বা অ্যাডমিন ড্যাশবোর্ডে যাওয়ার চেষ্টা করে
    // তাকে ধাক্কা দিয়ে তার নির্দিষ্ট রাউট /pos/pos এ পাঠিয়ে দিন
    if (
      pathname === "/" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin-dashboard")
    ) {
      return NextResponse.redirect(new URL("/pos/pos", request.url));
    }
  }

  // ৩. সাধারণ কাস্টমার (customer) প্রোটেকশন
  if (role === "customer") {
    // কাস্টমার যেন অ্যাডমিন প্যানেল বা POS প্যানেলে না ঢুকতে পারে
    if (
      pathname.startsWith("/admin-dashboard") ||
      pathname.startsWith("/pos")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ৪. মেইন এডমিন (admin) প্রোটেকশন
  if (role === "admin") {
    // এডমিন যদি ভুল করে সাধারণ কাস্টমার ড্যাশবোর্ডে যায়
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// এই কনফিগুরেশনটি নিশ্চিত করে যে কোন কোন রুটে মিডলওয়্যার চেক করবে
export const config = {
  matcher: ["/dashboard/:path*", "/admin-dashboard/:path*", "/pos/:path*", "/"],
};
