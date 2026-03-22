import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const { handlers, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = (credentials.email as string).trim().toLowerCase();

        // ── 1. Fetch custom user record ──
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id, name, email, password, role, organization_id, is_verified")
          .eq("email", normalizedEmail)
          .single();

        if (error || !user) return null;

        // ── 2. Verify password ──
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        // ── 3. Check Custom Email Verification ──
        if (user.is_verified === false) {
          class EmailNotVerified extends CredentialsSignin {
            code = "EMAIL_NOT_VERIFIED";
          }
          throw new EmailNotVerified();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organization_id,
        };
      },
    }),
  ],
});
