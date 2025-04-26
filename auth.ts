import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

// Extend the User type to include role
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user?: User & {
      role?: string;
    };
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

// Define passkeys for different roles
const validPasskeys = {
  judge: "judge-passkey-123",
  admin: "admin-passkey-456",
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        passkey: { label: "Passkey", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.passkey) {
          return null;
        }

        // Check if the provided passkey is valid
        let role = null;
        if (credentials.passkey === validPasskeys.judge) {
          role = "judge";
        } else if (credentials.passkey === validPasskeys.admin) {
          role = "admin";
        }

        if (!role) {
          console.log("Invalid passkey");
          return null;
        }

        // Return user object with role
        return {
          id: role,
          name: role.charAt(0).toUpperCase() + role.slice(1),
          role: role,
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
      const isTeamsCreateRoute = pathname.startsWith("/admin/teams-create");
      const isManageRoute = pathname.startsWith("/admin/manage");

      // Admin-only routes
      if (isTeamsCreateRoute || isManageRoute) {
        return isLoggedIn && auth?.user?.role === "admin";
      }

      // Both judge and admin roles can access other admin routes
      if (isAdminRoute) {
        return (
          isLoggedIn &&
          (auth?.user?.role === "admin" || auth?.user?.role === "judge")
        );
      }

      return true;
    },
    session({ session, token }) {
      if (token?.role && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
  },
});
