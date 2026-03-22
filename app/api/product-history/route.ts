import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/getContext";
import { supabaseAdmin } from "@/lib/supabaseClient";

/** Map friendly search keywords → DB category enum values */
function normalizeCategorySearch(q: string): string | null {
  const lower = q.toLowerCase().trim();
  if (lower === "rough")                          return "ROUGH";
  if (lower === "ready" || lower === "ready goods" || lower === "ready_goods") return "READY_GOODS";
  if (lower === "by order" || lower === "by_order" || lower === "order")       return "BY_ORDER";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const exact = searchParams.get("exact") === "true";
    const { organizationId } = await getTenantContext();

    /* ──────────────────────────────────────────────────────────
       NO SEARCH → return full list
    ────────────────────────────────────────────────────────── */
    if (!search) {
      const { data: allLots, error } = await supabaseAdmin
        .from("lots")
        .select("id, lot_number, item_name, supplier_name, category, created_at, products(name)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      const lotsSummary = (allLots || []).map((lot: any) => ({
        id: lot.id,
        lotNo: lot.lot_number,
        date: lot.created_at,
        itemName: lot.item_name || lot.products?.name,
        supplierName: lot.supplier_name,
        category: lot.category,
      }));

      return NextResponse.json({ type: "all", lots: lotsSummary });
    }

    /* ──────────────────────────────────────────────────────────
       SEARCH → broad OR query across multiple fields
    ────────────────────────────────────────────────────────── */
    const categoryMatch = normalizeCategorySearch(search);

    // Build filter: search lot_number, item_name, supplier_name, category
    let query = supabaseAdmin
      .from("lots")
      .select("id, lot_number, item_name, supplier_name, category, created_at, products(name)")
      .eq("organization_id", organizationId);

    if (categoryMatch) {
      // Pure category filter
      query = query.eq("category", categoryMatch);
    } else {
      // ilike on text columns + exact category
      query = query.or(
        `lot_number.ilike.%${search}%,item_name.ilike.%${search}%,supplier_name.ilike.%${search}%`
      );
    }

    const { data: matchedLots, error: searchErr } = await query.order("created_at", { ascending: false });
    if (searchErr) throw new Error(searchErr.message);

    // Also check lines_entry_sublots for matching sublot_no
    const { data: matchedSublots } = await supabaseAdmin
      .from("lines_entry_sublots")
      .select("sublot_no, lines_entries(lot_no, organization_id)")
      .ilike("sublot_no", `%${search}%`)
      .eq("organization_id", organizationId);

    // Collect any extra lot_numbers from the sublot match
    const sublotLotNumbers: string[] = (matchedSublots || [])
      .map((s: any) => s.lines_entries?.lot_no)
      .filter(Boolean);

    // If sublots match, fetch those parent lots too
    let extraLots: any[] = [];
    if (sublotLotNumbers.length > 0) {
      const { data: el } = await supabaseAdmin
        .from("lots")
        .select("id, lot_number, item_name, supplier_name, category, created_at, products(name)")
        .eq("organization_id", organizationId)
        .in("lot_number", sublotLotNumbers);
      extraLots = el || [];
    }

    // Merge & deduplicate by id
    const combined = [...(matchedLots || []), ...extraLots];
    const seen = new Set<string>();
    const deduped = combined.filter((l: any) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

    /* ── If no results found ── */
    if (deduped.length === 0) {
      return NextResponse.json({ error: "No products found matching your search" }, { status: 404 });
    }

    /* ── If exactly 1 result AND exact=true was explicitly requested → return full detail ── */
    if (exact && deduped.length === 1) {
      const lot = deduped[0];
      return await buildDetailResponse(lot.id, organizationId);
    }

    /* ── Otherwise (even if 1 result), return list view ── */
    return NextResponse.json({
      type: "all",
      lots: deduped.map((lot: any) => ({
        id: lot.id,
        lotNo: lot.lot_number,
        date: lot.created_at,
        itemName: lot.item_name || lot.products?.name,
        supplierName: lot.supplier_name,
        category: lot.category,
      })),
    });

  } catch (error: any) {
    console.error("[product-history GET]", error);
    return NextResponse.json({ error: "Failed to fetch product history" }, { status: 500 });
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Helper: fetch full lifecycle detail for a single lot
────────────────────────────────────────────────────────────────────────── */
async function buildDetailResponse(lotId: string, organizationId: string) {
  const { data: lot, error: lotErr } = await supabaseAdmin
    .from("lots")
    .select("*, products(*), purchases(*)")
    .eq("id", lotId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (lotErr || !lot) {
    return NextResponse.json({ error: "Product history not found" }, { status: 404 });
  }

  const [
    { data: manufacturing },
    { data: rejections },
    { data: sales },
    { data: linesMaster },
    { data: linesSublot },
  ] = await Promise.all([
    supabaseAdmin.from("manufacturing").select("*").eq("lot_id", lot.id).eq("organization_id", organizationId),
    supabaseAdmin.from("rejections").select("*").eq("lot_id", lot.id).eq("organization_id", organizationId),
    supabaseAdmin.from("sales").select("*").eq("lot_id", lot.id).eq("organization_id", organizationId),
    supabaseAdmin.from("lines_entries").select("*, sublots:lines_entry_sublots(*)").eq("lot_no", lot.lot_number).eq("organization_id", organizationId).maybeSingle(),
    supabaseAdmin.from("lines_entry_sublots").select("*, master:lines_entries(*)").eq("sublot_no", lot.lot_number).eq("organization_id", organizationId).maybeSingle(),
  ]);

  const totalPurchaseCost     = (lot.purchases || []).reduce((a: number, p: any) => a + (p.total_cost || 0), 0);
  const totalManufacturingCost = (manufacturing || []).reduce((a: number, m: any) => a + (m.total_manufacturing_cost || 0), 0);
  const totalRevenue           = (sales || []).reduce((a: number, s: any) => a + (s.final_bill_amount || 0), 0);
  const totalProductCost       = totalPurchaseCost + totalManufacturingCost;

  const formattedLot = {
    ...lot,
    lotNo: lot.lot_number,
    itemName: lot.item_name || lot.products?.name,
    supplierName: lot.supplier_name || linesMaster?.supplier,
    purchases: lot.purchases || [],
    manufacturing: manufacturing || [],
    rejections: rejections || [],
    sales: sales || [],
    linesMaster,
    linesSublot,
  };

  return NextResponse.json({
    lot: formattedLot,
    metrics: {
      totalPurchaseCost,
      totalManufacturingCost,
      totalProductCost,
      totalRevenue,
      netProfit: totalRevenue - totalProductCost,
      currentAvailableWeight: lot.net_weight || 0,
    },
  });
}
