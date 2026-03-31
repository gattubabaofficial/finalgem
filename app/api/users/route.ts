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
    const { organizationId, role: requesterRole } = await getTenantContext();
    let query = supabaseAdmin
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (requesterRole !== "SUPERADMIN") {
      query = query.eq("organization_id", organizationId);
    }

    const { data: users, error } = await query;

    let organizations: any[] = [];
    if (requesterRole === "SUPERADMIN") {
      const { data: orgs } = await supabaseAdmin
        .from("organizations")
        .select("id, name")
        .order("name", { ascending: true });
      organizations = orgs || [];
    }

    if (error) throw new Error(error.message);
    return NextResponse.json({ 
      users: (users || []).map((u) => ({ ...u, isActive: true })),
      requesterRole,
      organizations
    });
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
    const { organizationId: requesterOrgId, role: requesterRole } = await getTenantContext();
    const { name, email, password, role, organization_id } = await req.json();
    const hashed = await bcrypt.hash(password, 12);

    const targetOrgId = requesterRole === "SUPERADMIN" ? (organization_id || null) : requesterOrgId;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({ 
        name, 
        email, 
        password: hashed, 
        role, 
        organization_id: targetOrgId,
        is_verified: true
      })
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { organizationId: requesterOrgId, role: requesterRole } = await getTenantContext();
    const { id, name, role, organization_id, password } = await req.json();

    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    // 1. Fetch current user to verify permission
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("organization_id, role")
      .eq("id", id)
      .single();

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Permission check: Only SUPERADMIN can edit users from other orgs
    if (requesterRole !== "SUPERADMIN" && targetUser.organization_id !== requesterOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Prepare update data
    const updateData: any = { name, role };
    if (requesterRole === "SUPERADMIN" && organization_id !== undefined) {
      updateData.organization_id = organization_id;
    }
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, name, email, role, created_at")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ user: updatedUser });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const requesterId = (session?.user as any)?.id;
    
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { organizationId: requesterOrgId, role: requesterRole } = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    if (userId === requesterId) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

    // 1. Fetch current user to verify permission
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("organization_id, role")
      .eq("id", userId)
      .single();

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Permission check
    if (requesterRole !== "SUPERADMIN" && targetUser.organization_id !== requesterOrgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Delete user
    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
