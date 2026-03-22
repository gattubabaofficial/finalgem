import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();

    const { data: ledger, error } = await supabaseAdmin
      .from("stock_ledgers")
      .select("*, product:products(*)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json(ledger || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
