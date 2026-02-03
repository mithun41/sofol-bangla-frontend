import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  // ১. যদি টোকেন না থাকে এবং প্রোটেক্টড রুটে ঢোকার চেষ্টা করে
  if (
    !token &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin-dashboard"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ২. কাস্টমার যদি এডমিন ড্যাশবোর্ডে (/admin-dashboard) যাওয়ার চেষ্টা করে
  // এখানে 'admin' ছাড়া অন্য যেকোনো কিছু (customer বা undefined) হলে আটকে দেবে
  if (pathname.startsWith("/admin-dashboard") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ৩. এডমিন যদি সাধারণ ড্যাশবোর্ডে (/dashboard) ঢোকার চেষ্টা করে
  if (
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/admin-dashboard") &&
    role === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }

  return NextResponse.next();
}

// এই কনফিগুরেশনটি নিশ্চিত করুন যাতে সঠিক পেজগুলোতে মিডলওয়্যার ট্রিগার হয়
export const config = {
  matcher: ["/dashboard/:path*", "/admin-dashboard/:path*"],
};
