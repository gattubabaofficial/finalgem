import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const refType = searchParams.get("transactionType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const { organizationId } = await getTenantContext();

    let query = supabaseAdmin
      .from("stock_ledgers")
      .select("*, product:products(*)", { count: "exact" })
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (productId) query = query.eq("product_id", productId);
    if (refType) query = query.eq("transaction_type", refType);

    const { data: entries, count, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ entries: entries || [], total: count || 0, page, limit });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}
