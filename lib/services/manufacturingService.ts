import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";

export async function getManufacturing(organizationId: string, search?: string) {
  let query = supabaseAdmin
    .from("manufacturing")
    .select("*, lot:lots(*, product:products(*))")
    .eq("organization_id", organizationId)
    .order("date", { ascending: false });

  if (search) {
    query = query.or(
      `process_type.ilike.%${search}%,issued_to.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return toCamelCase(data || []);
}

export async function createManufacturing(data: any, organizationId: string) {
  if (!organizationId) throw new Error("Organization ID is required to create a manufacturing record");

  // 1. Create Manufacturing Record
  const { data: mfg, error: mfgErr } = await supabaseAdmin
    .from("manufacturing")
    .insert({
      lot_id: data.lotId,
      issued_to: data.issuedTo,
      process_type: data.processType,
      date: data.date || new Date().toISOString(),
      weight: data.weight,
      weight_unit: data.weightUnit || "G",
      pieces: data.pieces,
      shape: data.shape,
      size: data.size,
      lines: data.lines,
      length: data.lineLength || data.length,
      labour_cost: data.labourCost || 0,
      other_cost: data.otherCost || 0,
      total_manufacturing_cost: (data.labourCost || 0) + (data.otherCost || 0),
      status: data.status || "COMPLETED",
      output_quantity: data.outputQuantity || data.pieces,
      organization_id: organizationId,
    })
    .select("*, lot:lots(*)")
    .single();

  if (mfgErr) throw new Error(mfgErr.message);

  // 2. Update Lot Status & Deduct Weight
  const lotRemainingWeight = (mfg.lot.net_weight || 0) - (parseFloat(data.weight) || 0);
  const lotRemainingGross = (mfg.lot.gross_weight || 0) - (parseFloat(data.weight) || 0);
  
  await supabaseAdmin
    .from("lots")
    .update({ 
      status: data.status === "COMPLETED" ? "READY" : "IN_PROCESS",
      net_weight: lotRemainingWeight,
      gross_weight: lotRemainingGross
    })
    .eq("id", data.lotId);

  // 3. Stock Ledger Entry
  await supabaseAdmin.from("stock_ledgers").insert({
    product_id: mfg.lot.product_id,
    transaction_type: "MANUFACTURING_RECEIPT",
    weight: data.weight,
    quantity: data.pieces,
    reference_id: mfg.id,
    organization_id: organizationId,
  });

  return toCamelCase(mfg);
}

export async function deleteManufacturing(id: string, organizationId: string) {
  const { data: mfg, error: fetchErr } = await supabaseAdmin
    .from("manufacturing")
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchErr || !mfg) throw new Error("Manufacturing record not found");

  // Remove ledger entry
  await supabaseAdmin
    .from("stock_ledgers")
    .delete()
    .eq("reference_id", id)
    .eq("transaction_type", "MANUFACTURING_RECEIPT")
    .eq("organization_id", organizationId);

  const { error } = await supabaseAdmin
    .from("manufacturing")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function getManufacturingById(id: string, organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("manufacturing")
    .select("*, lot:lots(*, product:products(*))")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return toCamelCase(data);
}

export async function updateManufacturing(id: string, data: any, organizationId: string) {
  // 1. Fetch existing manufacturing
  const { data: mfg, error: fetchErr } = await supabaseAdmin
    .from("manufacturing")
    .select("*, lot:lots(*)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchErr || !mfg) throw new Error("Manufacturing record not found");

  // 2. Update Manufacturing Record
  const { data: updatedMfg, error: updateErr } = await supabaseAdmin
    .from("manufacturing")
    .update({
      issued_to: data.issuedTo,
      process_type: data.processType,
      date: data.date,
      weight: data.weight,
      weight_unit: data.weightUnit,
      pieces: data.pieces,
      shape: data.shape,
      size: data.size,
      lines: data.lines,
      length: data.lineLength || data.length,
      labour_cost: data.labourCost,
      other_cost: data.otherCost,
      total_manufacturing_cost: (data.labourCost || 0) + (data.otherCost || 0),
      status: data.status,
      output_quantity: data.outputQuantity || data.pieces,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) throw new Error(updateErr.message);

  // 3. Update the Lot Number (sublot number) if specifically provided
  if (data.subLotNo && data.subLotNo !== mfg.lot.lot_number) {
    const { error: lotUpdateErr } = await supabaseAdmin
      .from("lots")
      .update({ lot_number: data.subLotNo })
      .eq("id", mfg.lot_id)
      .eq("organization_id", organizationId);
      
    if (lotUpdateErr) throw new Error(lotUpdateErr.message);
  }

  return toCamelCase(updatedMfg);
}

