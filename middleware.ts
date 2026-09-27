import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");
  const isWorkerProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/submissions") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/earnings") ||
    pathname.startsWith("/missions") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/referrals") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");
  const isBusinessProtected = pathname.startsWith("/business");
  const isAdminProtected = pathname.startsWith("/admin");

  // If visiting public tasks page or task details as visitor, allow it
  const isPublicTaskBrowse = pathname === "/tasks";

  if (!user && (isWorkerProtected || isBusinessProtected || isAdminProtected) && !isPublicTaskBrowse) {
    // In local development or testing without Supabase credentials configured, allow bypass if DEMO mode
    const isMockAuth = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" || !process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!isMockAuth) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
