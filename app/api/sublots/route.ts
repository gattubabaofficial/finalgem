import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const includePurchase = searchParams.get("includePurchase") === "true";
    const { organizationId } = await getTenantContext();

    let query = supabaseAdmin
      .from("lots")
      .select("*, product:products(*)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`lot_number.ilike.%${search}%`);
    }

    const { data: lots, error } = await query;
    if (error) throw new Error(error.message);

    const subLots = (lots || []).map((lot: any) => ({
      id: lot.id,
      subLotNo: lot.lot_number,
      lotId: lot.id,
      lot: { ...lot, lotNo: lot.lot_number, lotNumber: lot.lot_number, itemName: lot.product?.name },
      weight: lot.net_weight || 0,
      weightUnit: "G",
      pieces: lot.quantity,
      status: "IN_STOCK",
      createdAt: lot.created_at,
    }));

    let purchasesByLotId: Record<string, any> = {};
    let manufacturingByLotId: Record<string, any> = {};
    if (includePurchase && (lots || []).length > 0) {
      const lotIds = (lots || []).map((l: any) => l.id);
      
      const { data: purchases } = await supabaseAdmin
        .from("purchases")
        .select("*")
        .in("lot_id", lotIds)
        .eq("organization_id", organizationId)
        .order("date", { ascending: false });

      for (const p of purchases || []) {
        if (!purchasesByLotId[p.lot_id]) {
          purchasesByLotId[p.lot_id] = {
            ...p,
            netWeight: p.net_weight,
            pieces: p.pieces,
          };
        }
      }

      const { data: mnfs } = await supabaseAdmin
        .from("manufacturing")
        .select("*")
        .in("lot_id", lotIds)
        .eq("organization_id", organizationId)
        .order("date", { ascending: false });

      for (const m of mnfs || []) {
        if (!manufacturingByLotId[m.lot_id]) {
          manufacturingByLotId[m.lot_id] = m;
        }
      }
    }

    return NextResponse.json(toCamelCase({ subLots, purchasesByLotId, manufacturingByLotId }));
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Splitting is now handled at the Lot level" },
    { status: 400 }
  );
}
