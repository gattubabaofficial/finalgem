import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { getTenantContext } from "@/lib/auth/getContext";
import * as linesEntryService from "@/lib/services/linesEntryService";

function isAdmin(session: any) {
  const role = (session?.user as any)?.role;
  return role === "ADMIN" || role === "SUPERADMIN";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const entry = await linesEntryService.getLinesEntryById((await params).id, organizationId);
    if (!entry) return NextResponse.json({ error: "Lines entry not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const entry = await linesEntryService.updateLinesEntry((await params).id, body, organizationId);
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { organizationId } = await getTenantContext();
    await linesEntryService.deleteLinesEntry((await params).id, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
