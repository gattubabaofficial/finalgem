import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { organizationId } = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const excludeCategory = searchParams.get("excludeCategory") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabaseAdmin
      .from("purchases")
      .select(
        `*, lot:lots(
          *,
          product:products(*),
          manufacturing(*),
          sales(*)
        )`
      )
      .eq("organization_id", organizationId)
      .order("date", { ascending: false });

    if (category) {
      query = query.eq("lot.category", category);
    }

    const { data: purchases, error } = await query;
    if (error) throw new Error(error.message);

    let mapped = (purchases || [])
      .filter((p: any) => {
        if (category && (!p.lot || p.lot.category !== category)) return false;
        if (excludeCategory && p.lot?.category === excludeCategory) return false;
        if (status) return (p.lot?.status || "IN_STOCK") === status;
        return true;
      });

    if (search) {
      const s = search.toLowerCase();
      mapped = mapped.filter((p: any) => {
        const lotNo = p.lot?.lot_number?.toLowerCase() || "";
        const supplier = p.supplier?.toLowerCase() || p.lot?.supplier_name?.toLowerCase() || "";
        const item = p.item_name?.toLowerCase() || p.lot?.item_name?.toLowerCase() || "";
        const hasWorker = p.lot?.manufacturing?.some((m: any) => m.worker_name?.toLowerCase().includes(s));
        const hasBuyer = p.lot?.sales?.some((sl: any) => sl.buyer_name?.toLowerCase().includes(s));
        
        return lotNo.includes(s) || supplier.includes(s) || item.includes(s) || hasWorker || hasBuyer;
      });
    }

    const total = mapped.length;
    mapped = mapped.slice((page - 1) * limit, page * limit).map((p: any) => {
        const lot = p.lot;
        const netWt = (p.gross_weight || 0) - (p.less_weight || 0);
        const rejWt = p.rejection_weight || 0;
        const selectionWeight = Math.max(0, netWt - rejWt);
        return {
          id: p.id,
          subLotNo: lot?.lot_number || "—",
          lotId: lot?.id || "",
          status: lot?.status || "IN_STOCK",
          weight: selectionWeight,
          weightUnit: p.weight_unit || "G",
          pieces:
            p.rejection_pieces != null && p.pieces != null
              ? Math.max(0, p.pieces - p.rejection_pieces)
              : p.pieces ?? null,
          shape: p.shape,
          size: p.size,
          lines: p.lines,
          length: p.line_length,
          updatedAt: p.date,
          lot: {
            lotNumber: lot?.lot_number || "—",
            itemName: p.item_name || lot?.item_name || lot?.product?.name || null,
            category: lot?.category || lot?.product?.category || "",
            supplierName: p.supplier || lot?.supplier_name || null,
            grossWeight: p.gross_weight ?? 0,
            netWeight: netWt,
          },
          manufacturing: lot?.manufacturing || [],
          sales: lot?.sales || [],
          purchasePrice: p.purchase_price,
          totalCost: p.total_cost,
          purchaseDate: p.date,
          rejectionWeight: p.rejection_weight,
          rejectionPieces: p.rejection_pieces,
          rejectionStatus: p.rejection_status,
        };
      });

    return NextResponse.json({
      subLots: mapped,
      total: total || 0,
      page,
      limit,
      summary: {
        readyCount: mapped.filter((g: any) => g.status === "READY").length,
        partiallySoldCount: mapped.filter((g: any) => g.status === "PARTIALLY_SOLD").length,
        inStockCount: mapped.filter((g: any) => g.status === "IN_STOCK").length,
        totalAvailable: mapped.length,
        totalWeight: mapped.reduce((acc: number, g: any) => {
          let w = g.weight || 0;
          if (g.weightUnit === "KG") w *= 1000;
          else if (g.weightUnit === "CT") w *= 0.2;
          return acc + w;
        }, 0),
      },
    });
  } catch (e: any) {
    console.error("[finished-goods] ERROR:", e);
    return NextResponse.json({ error: e?.message || "Internal server error" }, { status: 500 });
  }
}
