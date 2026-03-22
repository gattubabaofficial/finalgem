import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTenantContext } from "@/lib/auth/getContext";
import * as linesEntryService from "@/lib/services/linesEntryService";

// PATCH /api/lines-entry/sublot/[sublotId]
export async function PATCH(req: Request, { params }: { params: Promise<{ sublotId: string }> }) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const sublot = await linesEntryService.updateLinesEntrySublot((await params).sublotId, body, organizationId);
    return NextResponse.json(sublot);
  } catch (error: any) {
    if (error.message?.includes("unique_violation") || error.code === "23505") {
      return NextResponse.json({ error: "This Sublot No already exists. Please use a unique number." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
