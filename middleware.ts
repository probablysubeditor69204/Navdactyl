import { withAuth } from "next-auth/middleware"

export default withAuth(
    // `withAuth` augments your `Request` with the user's token.
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdmin = !!token?.isAdmin;
        const isAdminPage = req.nextUrl.pathname.startsWith("/dashboard/admin");

        if (isAdminPage && !isAdmin) {
            return Response.redirect(new URL("/dashboard", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = { matcher: ["/dashboard/:path*"] }
