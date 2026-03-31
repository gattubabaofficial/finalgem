import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { organizationId } = await getTenantContext();

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ users: (users || []).map((u) => ({ ...u, isActive: true })) });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { organizationId } = await getTenantContext();
    const { name, email, password, role } = await req.json();
    const hashed = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({ name, email, password: hashed, role, organization_id: organizationId })
      .select("id, name, email, role, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      throw new Error(error.message);
    }
    return NextResponse.json({ user: { ...user, isActive: true } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
