import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";


export async function getPurchases(organizationId: string, search?: string) {
  let query = supabaseAdmin
    .from("purchases")
    .select("*, lot:lots(*, product:products(*), manufacturing(*), sales(*))")
    .eq("organization_id", organizationId)
    .order("date", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let mapped = toCamelCase(data || []);

  if (search) {
    const s = search.toLowerCase();
    mapped = mapped.filter((p: any) => {
      const lotNo = p.lot?.lotNumber?.toLowerCase() || "";
      const supplier = p.supplier?.toLowerCase() || p.lot?.supplierName?.toLowerCase() || "";
      const item = p.itemName?.toLowerCase() || p.lot?.itemName?.toLowerCase() || "";
      const hasWorker = p.lot?.manufacturing?.some((m: any) => m.workerName?.toLowerCase().includes(s));
      const hasBuyer = p.lot?.sales?.some((sl: any) => sl.buyerName?.toLowerCase().includes(s));
      
      return lotNo.includes(s) || supplier.includes(s) || item.includes(s) || hasWorker || hasBuyer;
    });
  }

  return mapped;
}

export async function createPurchase(data: any, organizationId: string) {
  if (!organizationId) throw new Error("Organization ID is required to create a purchase");

  // 1. Find or Create Product
  let { data: product } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("name", data.itemName || "General Item")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!product) {
    const { data: newProduct, error: pErr } = await supabaseAdmin
      .from("products")
      .insert({
        name: data.itemName || "General Item",
        category: data.category || "ROUGH",
        organization_id: organizationId,
      })
      .select()
      .single();
    if (pErr) throw new Error(pErr.message);
    product = newProduct;
  }

  // Guard: product must be non-null at this point
  if (!product) throw new Error("Failed to find or create product");

  // 2. Create the Lot
  const { data: lot, error: lotErr } = await supabaseAdmin
    .from("lots")
    .insert({
      lot_number: data.lotNo,
      product_id: product.id,
      item_name: data.itemName,
      supplier_name: data.supplierName,
      category: data.category,
      description_ref: data.descriptionRef,
      gross_weight: data.grossWeight,
      less_weight: data.lessWeight || 0,
      net_weight: data.grossWeight - (data.lessWeight || 0),
      weight_unit: data.weightUnit || "G",
      size: data.size,
      shape: data.shape,
      pieces: data.pieces,
      lines: data.lines,
      line_length: data.lineLength,
      quantity: data.pieces || 0,
      status: "IN_STOCK",
      organization_id: organizationId,
    })
    .select()
    .single();
  if (lotErr) throw new Error(lotErr.message);

  // 3. Create the Purchase record
  const { data: purchase, error: purchErr } = await supabaseAdmin
    .from("purchases")
    .insert({
      lot_id: lot.id,
      supplier: data.supplierName || data.supplier,
      item_name: data.itemName,
      description_ref: data.descriptionRef,
      date: data.date || new Date().toISOString(),
      gross_weight: data.grossWeight,
      less_weight: data.lessWeight || 0,
      net_weight: data.grossWeight - (data.lessWeight || 0),
      weight_unit: data.weightUnit || "G",
      size: data.size,
      shape: data.shape,
      pieces: data.pieces,
      lines: data.lines,
      line_length: data.lineLength,
      purchase_price: data.purchasePrice,
      total_cost: data.purchasePrice,
      cost_per_gram: data.purchasePrice / (data.grossWeight - (data.lessWeight || 0)) || 0,
      rejection_weight: data.rejectionWeight,
      rejection_pieces: data.rejectionPieces,
      rejection_lines: data.rejectionLines,
      rejection_length: data.rejectionLength,
      rejection_date: data.rejectionDate || null,
      rejection_status: data.rejectionStatus || "PENDING",
      organization_id: organizationId,
    })
    .select()
    .single();
  if (purchErr) throw new Error(purchErr.message);

  // 4. Update Stock Ledger
  await supabaseAdmin.from("stock_ledgers").insert({
    product_id: product.id,
    transaction_type: "PURCHASE",
    weight: data.grossWeight - (data.lessWeight || 0),
    quantity: data.pieces,
    reference_id: purchase.id,
    organization_id: organizationId,
  });

  return purchase;
}

export async function getPurchaseById(id: string, organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("purchases")
    .select("*, lot:lots(*, product:products(*))")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return toCamelCase(data);
}

export async function updatePurchase(id: string, data: any, organizationId: string) {
  // 1. Fetch existing purchase
  const { data: purchase, error: fetchErr } = await supabaseAdmin
    .from("purchases")
    .select("lot_id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchErr || !purchase) throw new Error("Purchase not found");

  // 2. Update the Lot
  await supabaseAdmin
    .from("lots")
    .update({
      lot_number: data.lotNo,
      item_name: data.itemName,
      supplier_name: data.supplierName,
      category: data.category,
      description_ref: data.descriptionRef,
      gross_weight: data.grossWeight,
      less_weight: data.lessWeight || 0,
      net_weight: data.grossWeight - (data.lessWeight || 0),
      weight_unit: data.weightUnit || "G",
      size: data.size,
      shape: data.shape,
      pieces: data.pieces,
      lines: data.lines,
      line_length: data.lineLength,
      quantity: data.pieces || 0,
    })
    .eq("id", purchase.lot_id);

  // 3. Update the Purchase record
  const { data: updated, error: updErr } = await supabaseAdmin
    .from("purchases")
    .update({
      supplier: data.supplierName || data.supplier || "",
      item_name: data.itemName,
      description_ref: data.descriptionRef,
      date: data.date || new Date().toISOString(),
      gross_weight: data.grossWeight,
      less_weight: data.lessWeight || 0,
      net_weight: data.grossWeight - (data.lessWeight || 0),
      weight_unit: data.weightUnit || "G",
      size: data.size,
      shape: data.shape,
      pieces: data.pieces,
      lines: data.lines,
      line_length: data.lineLength,
      purchase_price: data.purchasePrice,
      total_cost: data.purchasePrice,
      cost_per_gram: data.purchasePrice / (data.grossWeight - (data.lessWeight || 0)) || 0,
      rejection_weight: data.rejectionWeight,
      rejection_pieces: data.rejectionPieces,
      rejection_lines: data.rejectionLines,
      rejection_length: data.rejectionLength,
      rejection_date: data.rejectionDate || null,
      rejection_status: data.rejectionStatus || "PENDING",
    })
    .eq("id", id)
    .select()
    .single();

  if (updErr) throw new Error(updErr.message);

  // 4. Update Stock Ledger
  await supabaseAdmin
    .from("stock_ledgers")
    .update({
      weight: data.grossWeight - (data.lessWeight || 0),
      quantity: data.pieces,
    })
    .eq("reference_id", id)
    .eq("transaction_type", "PURCHASE")
    .eq("organization_id", organizationId);

  return updated;
}

export async function deletePurchase(id: string, organizationId: string) {
  // 1. Fetch the purchase to get lot_id
  const { data: purchase, error: fetchErr } = await supabaseAdmin
    .from("purchases")
    .select("lot_id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchErr || !purchase) throw new Error("Purchase not found");

  // 2. Delete Stock Ledger entries
  await supabaseAdmin
    .from("stock_ledgers")
    .delete()
    .eq("reference_id", id)
    .eq("transaction_type", "PURCHASE")
    .eq("organization_id", organizationId);

  // 3. Delete the purchase
  await supabaseAdmin.from("purchases").delete().eq("id", id);

  // 4. Delete the lot
  if (purchase.lot_id) {
    await supabaseAdmin.from("lots").delete().eq("id", purchase.lot_id);
  }
}
