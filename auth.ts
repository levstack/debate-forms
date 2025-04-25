import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Hardcoded test users
const testUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user with matching email and password
        const user = testUsers.find(
          (user) =>
            user.email === credentials.email &&
            user.password === credentials.password
        );

        if (!user) {
          console.log("Invalid credentials");
          return null;
        }

        // Return user object without the password
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = pathname.startsWith("/admin");

      if (isAdminRoute) {
        return isLoggedIn && auth?.user?.email === "admin@example.com";
      }
      return true;
    },
  },
});
