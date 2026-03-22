import { supabaseAdmin } from "@/lib/supabaseClient";

export async function getRejections(organizationId: string, search?: string) {
  // 1. Fetch Purchase Rejections
  let purchasesQuery = supabaseAdmin
    .from("purchases")
    .select("*, lot:lots(*)")
    .eq("organization_id", organizationId)
    .not("rejection_weight", "is", null)
    .order("date", { ascending: false });

  if (search) {
    purchasesQuery = purchasesQuery.or(
      `supplier.ilike.%${search}%,item_name.ilike.%${search}%`
    );
  }

  const { data: purchases = [] } = await purchasesQuery;

  // 2. Fetch Generic/Manufacturing Rejections
  let rejectionQuery = supabaseAdmin
    .from("rejections")
    .select("*, lot:lots(*, product:products(*))")
    .eq("organization_id", organizationId)
    .order("date", { ascending: false });

  if (search) {
    rejectionQuery = rejectionQuery.or(`reason.ilike.%${search}%`);
  }

  const { data: genericRejections = [] } = await rejectionQuery;

  // 3. Fetch Sales Returns
  let salesReturnQuery = supabaseAdmin
    .from("sales")
    .select("*, lot:lots(*)")
    .eq("organization_id", organizationId)
    .eq("is_return", true)
    .order("date", { ascending: false });

  if (search) {
    salesReturnQuery = salesReturnQuery.or(`customer.ilike.%${search}%`);
  }

  const { data: salesReturns = [] } = await salesReturnQuery;

  const mappedPurchases = (purchases || []).map((p: any) => ({
    id: p.id,
    date: p.date,
    supplierName: p.supplier,
    itemName: p.item_name,
    rejectionWeight: p.rejection_weight,
    rejectionPieces: p.rejection_pieces,
    rejectionLines: p.rejection_lines,
    rejectionDate: p.rejection_date,
    rejectionStatus: p.rejection_status,
    weightUnit: p.weight_unit,
    lot: { lotNo: p.lot?.lot_number, lotNumber: p.lot?.lot_number },
  }));

  const mappedMfgs = (genericRejections || []).map((r: any) => ({
    id: r.id,
    date: r.date,
    issuedTo: "—",
    rejectionWeight: r.weight,
    rejectionPieces: r.pieces,
    rejectionLines: r.lines,
    returnToManufacturer: r.sent_to_manufacturer,
    returnDate: r.date,
    status: r.status || "REJECTED",
    weightUnit: r.lot?.weight_unit || "G",
    lot: { lotNo: r.lot?.lot_number },
  }));

  const mappedSales = (salesReturns || []).map((s: any) => ({
    id: s.id,
    date: s.date,
    soldTo: s.customer,
    returnedWeight: s.returned_weight,
    returnedPieces: s.returned_pieces,
    returnedLines: s.returned_lines,
    returnDate: s.return_date,
    netSale: s.net_sale,
    status: "RETURNED",
    weightUnit: s.weight_unit,
    lot: { lotNo: s.lot?.lot_number },
  }));

  return {
    purchaseRejections: mappedPurchases,
    manufacturingRejections: mappedMfgs,
    salesReturns: mappedSales,
    summary: {
      purchasePending: mappedPurchases.filter((p: any) => p.rejectionStatus === "PENDING").length,
      mfgPending: mappedMfgs.length,
      salesReturnCount: mappedSales.length,
    },
  };
}

export async function getRejectionById(type: string, id: string, organizationId: string) {
  if (type === "purchase") {
    const { data: p } = await supabaseAdmin
      .from("purchases")
      .select("*, lot:lots(*)")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!p) return null;
    return {
      id: p.id, type: "purchase", date: p.date,
      supplierName: p.supplier, itemName: p.item_name,
      rejectionWeight: p.rejection_weight, rejectionPieces: p.rejection_pieces,
      rejectionLines: p.rejection_lines, rejectionDate: p.rejection_date,
      status: p.rejection_status, weightUnit: p.weight_unit,
      lotNo: p.lot?.lot_number, memo: p.description_ref,
      grossWeight: p.gross_weight, lessWeight: p.less_weight,
      pieces: p.pieces, lines: p.lines,
    };
  }

  if (type === "manufacturing") {
    const { data: r } = await supabaseAdmin
      .from("rejections")
      .select("*, lot:lots(*)")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!r) return null;
    return {
      id: r.id, type: "manufacturing", date: r.date,
      reason: r.reason, rejectionWeight: r.weight,
      rejectionPieces: r.pieces, rejectionLines: r.lines,
      status: r.status || "REJECTED", weightUnit: r.lot?.weight_unit || "G",
      lotNo: r.lot?.lot_number, sentToManufacturer: r.sent_to_manufacturer,
    };
  }

  if (type === "sales") {
    const { data: s } = await supabaseAdmin
      .from("sales")
      .select("*, lot:lots(*)")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!s) return null;
    return {
      id: s.id, type: "sales", date: s.date,
      soldTo: s.customer, returnedWeight: s.returned_weight,
      returnedPieces: s.returned_pieces, returnedLines: s.returned_lines,
      returnDate: s.return_date, netSale: s.net_sale,
      status: s.status || "PENDING", weightUnit: s.weight_unit,
      lotNo: s.lot?.lot_number, memo: s.description_ref,
    };
  }
  return null;
}

export async function updateRejectionStatus(type: string, id: string, status: string, organizationId: string) {
  if (type === "purchase") {
    const { error } = await supabaseAdmin
      .from("purchases")
      .update({ rejection_status: status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  if (type === "manufacturing") {
    const { error } = await supabaseAdmin
      .from("rejections")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  if (type === "sales") {
    const { error } = await supabaseAdmin
      .from("sales")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  throw new Error("Invalid rejection type");
}

export async function createRejection(
  data: { lotId: string; reason: string; quantity: number; sentToManufacturer: boolean; date?: Date },
  organizationId: string
) {
  // 1. Fetch the lot to get product_id
  const { data: lot } = await supabaseAdmin
    .from("lots")
    .select("product_id")
    .eq("id", data.lotId)
    .maybeSingle();

  // 2. Create Rejection
  const { data: rejection, error: rejErr } = await supabaseAdmin
    .from("rejections")
    .insert({
      lot_id: data.lotId,
      reason: data.reason,
      quantity: data.quantity,
      sent_to_manufacturer: data.sentToManufacturer,
      date: data.date ? data.date.toISOString() : new Date().toISOString(),
      organization_id: organizationId,
    })
    .select("*, lot:lots(*)")
    .single();

  if (rejErr) throw new Error(rejErr.message);

  // 3. Stock Ledger
  if (lot?.product_id) {
    await supabaseAdmin.from("stock_ledgers").insert({
      product_id: lot.product_id,
      transaction_type: "REJECTION",
      quantity: -data.quantity,
      reference_id: rejection.id,
      organization_id: organizationId,
    });
  }

  return rejection;
}

export async function deleteRejection(id: string, organizationId: string) {
  const { data: rejection, error: fetchErr } = await supabaseAdmin
    .from("rejections")
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchErr || !rejection) throw new Error("Rejection not found");

  await supabaseAdmin
    .from("stock_ledgers")
    .delete()
    .eq("reference_id", id)
    .eq("transaction_type", "REJECTION")
    .eq("organization_id", organizationId);

  const { error } = await supabaseAdmin.from("rejections").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
