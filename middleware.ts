import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET!;
const secretKey = new TextEncoder().encode(SECRET);

interface AppJWTPayload {
  userId?: string;
  isAdmin?: boolean;
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);
  return {
    userId: typeof payload.userId === "string" ? payload.userId : undefined,
    isAdmin: payload.isAdmin === true,
  } as AppJWTPayload;
}

function clearTokenCookie(response: NextResponse) {
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isAdminOnlyPage = pathname === "/register" || pathname.startsWith("/admin");

  // Login stays public. Every other matched page requires authentication.
  if (isLoginPage && !token) {
    return NextResponse.next();
  }

  if (isLoginPage && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/todayPage", req.url));
    } catch {
      const response = NextResponse.next();
      clearTokenCookie(response);
      return response;
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await verifyToken(token);
    
    // All authenticated users can add, edit, view patients, and generate reports.
    // Admin users can do all of that too, plus access admin-only pages.
    if (isAdminOnlyPage && !decoded.isAdmin) {
      return NextResponse.redirect(new URL("/todayPage", req.url));
    }
    
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    clearTokenCookie(response);
    return response;
  }
}

export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/patientRegistration/:path*", "/patientRecord/:path*", "/patientSummary/:path*", "/patientVerification/:path*", "/todayPage/:path*", "/admin/:path*"],
};
