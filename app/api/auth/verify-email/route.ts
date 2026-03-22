import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Fetch user by email
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, is_verified, verification_token")
      .eq("email", normalizedEmail)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json({ message: "Already verified." }, { status: 200 });
    }

    // 2. Validate the 6-digit OTP code
    if (user.verification_token !== code.trim()) {
      return NextResponse.json({ error: "Invalid or incorrect verification code." }, { status: 400 });
    }

    // 3. Mark as verified and clear the token safely
    const { error: updateErr } = await supabaseAdmin
      .from("users")
      .update({ is_verified: true, verification_token: null })
      .eq("id", user.id);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Server error during verification." }, { status: 500 });
  }
}
