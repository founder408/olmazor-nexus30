import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: "/volunteer", roles: ["volunteer", "organizer", "admin"] },
  { prefix: "/organizer", roles: ["organizer", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    const rule = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
    if (rule && (!role || !rule.roles.includes(role))) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?callbackUrl=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/volunteer/:path*", "/organizer/:path*", "/admin/:path*"],
};
