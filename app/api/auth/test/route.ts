import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, role");

    if (error) throw error;

    const { data: admin } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", "admin@gems.com")
      .maybeSingle();

    const results = {
      usersCount: users?.length || 0,
      users: (users || []).map((u) => ({ email: u.email, id: u.id, role: u.role })),
      adminExists: !!admin,
      passwordValid: admin ? await bcrypt.compare("admin123", admin.password) : false,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
