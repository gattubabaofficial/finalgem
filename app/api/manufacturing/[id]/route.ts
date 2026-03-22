import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { getTenantContext } from "@/lib/auth/getContext";
import * as manufacturingService from "@/lib/services/manufacturingService";

function isAdmin(session: any) {
  const role = (session?.user as any)?.role;
  return role === "ADMIN" || role === "SUPERADMIN";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const record = await manufacturingService.getManufacturingById((await params).id, organizationId);
    if (!record) return NextResponse.json({ error: "Manufacturing record not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden: Only admins can edit records." }, { status: 403 });
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const update = await manufacturingService.updateManufacturing((await params).id, body, organizationId);
    return NextResponse.json(update);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden: Only admins can delete records." }, { status: 403 });
    const { organizationId } = await getTenantContext();
    await manufacturingService.deleteManufacturing((await params).id, organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
