import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { organizationId } = await getTenantContext();

    const [
      { count: totalLots },
      { data: purchaseAgg },
      { data: salesAgg },
      { count: rejectionPending },
      { count: totalPurchases },
      { count: totalSales },
    ] = await Promise.all([
      supabaseAdmin
        .from("lots")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
      supabaseAdmin
        .from("purchases")
        .select("purchase_price")
        .eq("organization_id", organizationId),
      supabaseAdmin
        .from("sales")
        .select("sale_price")
        .eq("organization_id", organizationId),
      supabaseAdmin
        .from("rejections")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("sent_to_manufacturer", false),
      supabaseAdmin
        .from("purchases")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
      supabaseAdmin
        .from("sales")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId),
    ]);

    const purchaseValue = (purchaseAgg || []).reduce(
      (sum: number, p: any) => sum + (p.purchase_price || 0), 0
    );
    const salesValue = (salesAgg || []).reduce(
      (sum: number, s: any) => sum + (s.sale_price || 0), 0
    );
    const netProfitLoss = salesValue - purchaseValue;

    return NextResponse.json({
      totalLots: totalLots || 0,
      totalSubLots: totalLots || 0,
      totalPurchaseValue: purchaseValue,
      totalSaleValue: salesValue,
      netProfitLoss: netProfitLoss,
      pendingRejections: rejectionPending || 0,
      totalTransactions: (totalPurchases || 0) + (totalSales || 0),
      totalPurchases: totalPurchases || 0,
      totalSales: totalSales || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
