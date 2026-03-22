import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTenantContext } from "@/lib/auth/getContext";
import * as salesService from "@/lib/services/salesService";

function isAdmin(session: any) {
  const role = (session?.user as any)?.role;
  return role === "ADMIN" || role === "SUPERADMIN";
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden: Only admins can delete records." }, { status: 403 });
    const { organizationId } = await getTenantContext();
    await salesService.deleteSale((await params).id, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
