import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTenantContext } from "@/lib/auth/getContext";
import * as linesEntryService from "@/lib/services/linesEntryService";

export async function GET(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const entries = await linesEntryService.getLinesEntries(organizationId, search);
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const body = await req.json();
    const entry = await linesEntryService.createLinesEntry(body, organizationId);
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes("unique_violation") || error.code === "23505") {
      return NextResponse.json({ error: "This Lot No already exists. Please use a unique number." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
