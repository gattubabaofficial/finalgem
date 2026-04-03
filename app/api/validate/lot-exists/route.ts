import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { organizationId } = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const lotNo = searchParams.get("lotNo");

    if (!lotNo) return NextResponse.json({ exists: false });

    // 1. Check in regular lots
    const { data: lot } = await supabaseAdmin
      .from("lots")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("lot_number", lotNo)
      .maybeSingle();

    if (lot) return NextResponse.json({ exists: true, type: "lot" });

    // 2. Check in lines entries (master)
    const { data: lineMaster } = await supabaseAdmin
      .from("lines_entry")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("lot_no", lotNo)
      .maybeSingle();

    if (lineMaster) return NextResponse.json({ exists: true, type: "lines_master" });

    // 3. Check in lines entry sublots
    const { data: lineSublot } = await supabaseAdmin
      .from("lines_entry_sublots")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("sublot_no", lotNo)
      .maybeSingle();

    if (lineSublot) return NextResponse.json({ exists: true, type: "lines_sublot" });

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
