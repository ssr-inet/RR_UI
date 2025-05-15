import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";
import { Roles, ROUTES } from "./constants/enumdata";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  const allCookies = request.cookies.getAll();
  console.log("All cookies:", allCookies);
  console.log("Token cookie:", token);
  if (process.env.NODE_ENV === "development") {
    console.log("Middleware token:", token);
    console.log("Middleware pathname:", pathname);
  }
  // If token exists and trying to access login page, redirect to dashboard
  if (pathname === ROUTES.LOGIN && token) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }
  // Protected routes
  const protectedRoutes = [ROUTES.DASHBOARD, ROUTES.REGISTER];

  // Check protected pages
  if (protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    console.log("checking auth protectedRoutes");

    if (!token) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    const decoded = verifyToken(token);
    // if (!decoded) {
    //   const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    //   response.cookies.set({
    //     name: "token",
    //     value: "",
    //     maxAge: -1,
    //     path: "/",
    //   });
    //   return response;
    // }

    // Admin-only protection
    // if (pathname.startsWith(ROUTES.REGISTER) && decoded.role !== Roles.ADMIN) {
    //   return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    // }
  }

  return NextResponse.next();
}
