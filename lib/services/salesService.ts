import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";

export async function getSales(organizationId: string, search?: string) {
  let query = supabaseAdmin
    .from("sales")
    .select("*, lot:lots(*, product:products(*))")
    .eq("organization_id", organizationId)
    .order("date", { ascending: false });

  if (search) {
    query = query.or(
      `customer.ilike.%${search}%,bill_no.ilike.%${search}%,item_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return toCamelCase(data || []);
}

export async function createSale(data: any, organizationId: string) {
  if (!organizationId) throw new Error("Organization ID is required to create a sale");

  // 1. Create Sale Record
  const { data: sale, error: saleErr } = await supabaseAdmin
    .from("sales")
    .insert({
      lot_id: data.lotId,
      customer: data.customerName || data.customer,
      bill_no: data.billNo,
      date: data.date || new Date().toISOString(),
      item_name: data.itemName,
      description_ref: data.descriptionRef,
      weight: data.weight,
      weight_unit: data.weightUnit || "G",
      pieces: data.pieces,
      shape: data.shape,
      size: data.size,
      lines: data.lines,
      length: data.lineLength || data.length,
      sale_price: data.salePrice,
      discount: data.discount || 0,
      tax: data.tax || 0,
      net_sale: data.netSale,
      final_bill_amount: data.finalBillAmount,
      organization_id: organizationId,
    })
    .select("*, lot:lots(*)")
    .single();

  if (saleErr) throw new Error(saleErr.message);

  // 2. Update Lot Status
  await supabaseAdmin
    .from("lots")
    .update({ status: data.isPartial ? "PARTIALLY_SOLD" : "SOLD" })
    .eq("id", data.lotId);

  // 3. Stock Ledger Entry
  await supabaseAdmin.from("stock_ledgers").insert({
    product_id: sale.lot.product_id,
    transaction_type: "SALE",
    weight: -data.weight,
    quantity: -(data.pieces || 0),
    reference_id: sale.id,
    organization_id: organizationId,
  });

  return toCamelCase(sale);
}

export async function deleteSale(id: string, organizationId: string) {
  const { data: sale, error: fetchErr } = await supabaseAdmin
    .from("sales")
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchErr || !sale) throw new Error("Sale not found");

  await supabaseAdmin
    .from("stock_ledgers")
    .delete()
    .eq("reference_id", id)
    .eq("transaction_type", "SALE")
    .eq("organization_id", organizationId);

  const { error } = await supabaseAdmin.from("sales").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
