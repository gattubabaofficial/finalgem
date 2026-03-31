import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: organizations, error } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return NextResponse.json({ organizations });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}
