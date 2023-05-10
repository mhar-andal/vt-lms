import { authMiddleware } from "@clerk/nextjs";

console.log("mounting!!!!!!!!!!!!!!!!!!!!!!");

export default authMiddleware({
  debug: true,
  publicRoutes: ["/sign-up", "/sign-in", "/forgot-password", "/reset-password"],
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
