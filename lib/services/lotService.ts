import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";

export async function getLots(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("lots")
    .select("*, product:products(*)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return toCamelCase(data || []);
}

export async function createLot(
  data: { lotNumber: string; productId: string; weight?: number; quantity: number },
  organizationId: string
) {
  if (!organizationId) throw new Error("Organization ID is required to create a lot");

  // Check for duplicate lot number
  const { data: existing } = await supabaseAdmin
    .from("lots")
    .select("id")
    .eq("lot_number", data.lotNumber)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existing) {
    throw new Error(`Lot number "${data.lotNumber}" already exists. Please use a different Lot Number.`);
  }

  const { data: lot, error } = await supabaseAdmin
    .from("lots")
    .insert({
      lot_number: data.lotNumber,
      product_id: data.productId,
      quantity: data.quantity,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCamelCase(lot);
}

export async function getLotById(id: string, organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("lots")
    .select("*, product:products(*), purchases(*), sales(*)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return toCamelCase(data);
}

export async function deleteLot(id: string, organizationId: string) {
  const { error } = await supabaseAdmin
    .from("lots")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
}
