import { supabaseAdmin } from "@/lib/supabaseClient";

export async function createStockLedgerEntry({
  productId,
  transactionType,
  quantity,
  weight,
  referenceId,
  organizationId,
}: {
  productId: string;
  transactionType: "PURCHASE" | "SALE" | "MANUFACTURING_ISSUE" | "MANUFACTURING_RECEIPT" | "REJECTION";
  quantity?: number;
  weight?: number;
  referenceId: string;
  organizationId: string;
}) {
  if (!organizationId) {
    throw new Error("Organization ID is required to create a stock ledger entry");
  }

  const { data, error } = await supabaseAdmin
    .from("stock_ledgers")
    .insert({
      product_id: productId,
      transaction_type: transactionType,
      quantity,
      weight,
      reference_id: referenceId,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getProductStock(productId: string, organizationId: string) {
  const { data: ledgers, error } = await supabaseAdmin
    .from("stock_ledgers")
    .select("quantity")
    .eq("product_id", productId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  return (ledgers || []).reduce((total, entry) => total + (entry.quantity || 0), 0);
}
