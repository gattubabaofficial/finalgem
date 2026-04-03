import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";

export async function getLinesEntries(organizationId: string, search?: string) {
  const { data, error } = await supabaseAdmin
    .from("lines_entry")
    .select("*, sublots:lines_entry_sublots(*)")
    .eq("organization_id", organizationId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  let mapped = toCamelCase(data || []);

  if (search) {
    const s = search.toLowerCase();
    mapped = mapped.filter((e: any) =>
      e.lotNo?.toLowerCase().includes(s) ||
      e.supplier?.toLowerCase().includes(s) ||
      e.itemName?.toLowerCase().includes(s)
    );
  }

  return mapped;
}

export async function createLinesEntry(data: any, organizationId: string) {
  if (!organizationId) throw new Error("Organization ID is required");

  const bunch = Math.max(0, parseInt(data.bunch ?? "0") || 0);

  // 1. Create the master lines entry
  const { data: entry, error: entryErr } = await supabaseAdmin
    .from("lines_entry")
    .insert({
      lot_no: data.lotNo,
      date: data.date || new Date().toISOString(),
      item_name: data.itemName,
      supplier: data.supplier,
      description_ref: data.descriptionRef,
      gross_weight: data.grossWeight ? parseFloat(data.grossWeight) : 0,
      less_weight: data.lessWeight ? parseFloat(data.lessWeight) : 0,
      weight_unit: data.weightUnit || 'G',
      size: data.size,
      shape: data.shape,
      no_of_lines: data.noOfLines ? parseInt(data.noOfLines) : null,
      line_length_inch: data.lineLengthInch ? parseFloat(data.lineLengthInch) : null,
      line_length_mm: data.lineLengthMm ? parseFloat(data.lineLengthMm) : null,
      line_length_cm: data.lineLengthCm ? parseFloat(data.lineLengthCm) : null,
      selection_lines: data.selectionLines ? parseInt(data.selectionLines) : null,
      selection_length_inch: data.selectionLengthInch ? parseFloat(data.selectionLengthInch) : null,
      selection_length_mm: data.selectionLengthMm ? parseFloat(data.selectionLengthMm) : null,
      selection_length_cm: data.selectionLengthCm ? parseFloat(data.selectionLengthCm) : null,
      rejection_lines: data.rejectionLines ? parseInt(data.rejectionLines) : null,
      rejection_length_inch: data.rejectionLengthInch ? parseFloat(data.rejectionLengthInch) : null,
      rejection_length_mm: data.rejectionLengthMm ? parseFloat(data.rejectionLengthMm) : null,
      rejection_length_cm: data.rejectionLengthCm ? parseFloat(data.rejectionLengthCm) : null,
      bunch,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (entryErr) throw new Error(entryErr.message);

  // 2. Create N individual sublot rows
  if (bunch > 0) {
    for (let i = 1; i <= bunch; i++) {
      const sub = (data.sublots && data.sublots[i - 1]) || {};
      const { error: slErr } = await supabaseAdmin.from("lines_entry_sublots").insert({
        lines_entry_id: entry.id,
        sublot_no: sub.sublotNo || "",
        sublot_index: i,
        selection_lines: sub.selectionLines ? parseInt(sub.selectionLines) : null,
        selection_length_inch: sub.selectionLengthInch ? parseFloat(sub.selectionLengthInch) : null,
        selection_length_mm: sub.selectionLengthMm ? parseFloat(sub.selectionLengthMm) : null,
        selection_length_cm: sub.selectionLengthCm ? parseFloat(sub.selectionLengthCm) : null,
        rejection_lines: sub.rejectionLines ? parseInt(sub.rejectionLines) : null,
        rejection_length_inch: sub.rejectionLengthInch ? parseFloat(sub.rejectionLengthInch) : null,
        rejection_length_mm: sub.rejectionLengthMm ? parseFloat(sub.rejectionLengthMm) : null,
        rejection_length_cm: sub.rejectionLengthCm ? parseFloat(sub.rejectionLengthCm) : null,
        sent_to_finished_goods: false,
        organization_id: organizationId,
      });
      if (slErr) throw new Error(`Sublot ${i}: ${slErr.message}`);
    }
  }

  return entry;
}

export async function getLinesEntryById(id: string, organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("lines_entry")
    .select("*, sublots:lines_entry_sublots(*)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const result = toCamelCase(data);
  // Sort sublots by index
  if (result?.sublots) {
    result.sublots.sort((a: any, b: any) => (a.sublotIndex ?? 0) - (b.sublotIndex ?? 0));
  }
  return result;
}

export async function updateLinesEntry(id: string, data: any, organizationId: string) {
  const bunch = Math.max(0, parseInt(data.bunch ?? "0") || 0);

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("lines_entry")
    .update({
      lot_no: data.lotNo,
      date: data.date,
      item_name: data.itemName,
      supplier: data.supplier,
      description_ref: data.descriptionRef,
      gross_weight: data.grossWeight ? parseFloat(data.grossWeight) : 0,
      less_weight: data.lessWeight ? parseFloat(data.lessWeight) : 0,
      weight_unit: data.weightUnit || 'G',
      size: data.size,
      shape: data.shape,
      no_of_lines: data.noOfLines ? parseInt(data.noOfLines) : null,
      line_length_inch: data.lineLengthInch ? parseFloat(data.lineLengthInch) : null,
      line_length_mm: data.lineLengthMm ? parseFloat(data.lineLengthMm) : null,
      line_length_cm: data.lineLengthCm ? parseFloat(data.lineLengthCm) : null,
      selection_lines: data.selectionLines ? parseInt(data.selectionLines) : null,
      selection_length_inch: data.selectionLengthInch ? parseFloat(data.selectionLengthInch) : null,
      selection_length_mm: data.selectionLengthMm ? parseFloat(data.selectionLengthMm) : null,
      selection_length_cm: data.selectionLengthCm ? parseFloat(data.selectionLengthCm) : null,
      rejection_lines: data.rejectionLines ? parseInt(data.rejectionLines) : null,
      rejection_length_inch: data.rejectionLengthInch ? parseFloat(data.rejectionLengthInch) : null,
      rejection_length_mm: data.rejectionLengthMm ? parseFloat(data.rejectionLengthMm) : null,
      rejection_length_cm: data.rejectionLengthCm ? parseFloat(data.rejectionLengthCm) : null,
      bunch,
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (updErr) throw new Error(updErr.message);

  // Sync sublot count: get existing sublots ordered by index
  const { data: existingSublots } = await supabaseAdmin
    .from("lines_entry_sublots")
    .select("id, sublot_index")
    .eq("lines_entry_id", id)
    .order("sublot_index", { ascending: true });

  const currentCount = (existingSublots || []).length;

  if (bunch > currentCount) {
    // Add new empty sublots for the added positions
    for (let i = currentCount + 1; i <= bunch; i++) {
      await supabaseAdmin.from("lines_entry_sublots").insert({
        lines_entry_id: id,
        sublot_no: "",
        sublot_index: i,
        sent_to_finished_goods: false,
        organization_id: organizationId,
      });
    }
  } else if (bunch < currentCount) {
    // Remove excess sublots from the end
    const toRemove = (existingSublots || []).slice(bunch).map((s: any) => s.id);
    if (toRemove.length > 0) {
      await supabaseAdmin.from("lines_entry_sublots").delete().in("id", toRemove);
    }
  }

  return updated;
}

export async function updateLinesEntrySublot(sublotId: string, data: any, organizationId: string) {
  const { data: updated, error } = await supabaseAdmin
    .from("lines_entry_sublots")
    .update({
      // User-editable sublot number
      sublot_no: data.sublotNo ?? undefined,
      // Selection
      selection_lines: data.selectionLines !== "" && data.selectionLines != null ? parseInt(data.selectionLines) : null,
      selection_length_inch: data.selectionLengthInch !== "" && data.selectionLengthInch != null ? parseFloat(data.selectionLengthInch) : null,
      selection_length_mm: data.selectionLengthMm !== "" && data.selectionLengthMm != null ? parseFloat(data.selectionLengthMm) : null,
      selection_length_cm: data.selectionLengthCm !== "" && data.selectionLengthCm != null ? parseFloat(data.selectionLengthCm) : null,
      // Rejection
      rejection_lines: data.rejectionLines !== "" && data.rejectionLines != null ? parseInt(data.rejectionLines) : null,
      rejection_length_inch: data.rejectionLengthInch !== "" && data.rejectionLengthInch != null ? parseFloat(data.rejectionLengthInch) : null,
      rejection_length_mm: data.rejectionLengthMm !== "" && data.rejectionLengthMm != null ? parseFloat(data.rejectionLengthMm) : null,
      rejection_length_cm: data.rejectionLengthCm !== "" && data.rejectionLengthCm != null ? parseFloat(data.rejectionLengthCm) : null,
      // FG flag
      sent_to_finished_goods: data.sentToFinishedGoods ?? false,
    })
    .eq("id", sublotId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // --- If sent to finished goods, create a standard lot/purchase/stock record (idempotent) ---
  if (data.sentToFinishedGoods) {
    // Check if lot already exists to avoid duplicates
    const lotNum = data.sublotNo || `LE-${sublotId.slice(0, 4)}`;
    const { data: existingLot } = await supabaseAdmin
      .from("lots")
      .select("id")
      .eq("lot_number", lotNum)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (!existingLot) {
      // 1. Find or create a product
      const itemName = data.itemName || "Lines Entry Item";
      let { data: product } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("name", itemName)
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (!product) {
        const { data: newP, error: pErr } = await supabaseAdmin
          .from("products")
          .insert({
            name: itemName,
            category: "READY_GOODS",
            organization_id: organizationId,
          })
          .select()
          .single();
        if (pErr) throw new Error(`Product: ${pErr.message}`);
        product = newP;
      }

      if (product) {
        // 2. Create the Lot
        const { data: lot, error: lotErr } = await supabaseAdmin
          .from("lots")
          .insert({
            lot_number: lotNum,
            product_id: product.id,
            item_name: itemName,
            supplier_name: data.supplier,
            category: "READY_GOODS",
            description_ref: data.descriptionRef,
            gross_weight: 0,
            less_weight: 0,
            net_weight: 0,
            weight_unit: "G",
            lines: data.selectionLines ? parseInt(data.selectionLines) : 0,
            line_length: data.selectionLengthInch ? parseFloat(data.selectionLengthInch) : 0,
            quantity: data.selectionLines ? parseInt(data.selectionLines) : 0,
            status: "IN_STOCK",
            organization_id: organizationId,
          })
          .select()
          .single();

        if (!lotErr && lot) {
          // 3. Create the Purchase record
          const { data: purchase, error: purchErr } = await supabaseAdmin
            .from("purchases")
            .insert({
              lot_id: lot.id,
              supplier: data.supplier,
              item_name: itemName,
              description_ref: data.descriptionRef,
              date: new Date().toISOString(),
              gross_weight: 0,
              less_weight: 0,
              net_weight: 0,
              weight_unit: "G",
              lines: data.selectionLines ? parseInt(data.selectionLines) : 0,
              line_length: data.selectionLengthInch ? parseFloat(data.selectionLengthInch) : 0,
              pieces: data.selectionLines ? parseInt(data.selectionLines) : 0,
              purchase_price: 0,
              total_cost: 0,
              cost_per_gram: 0,
              organization_id: organizationId,
            })
            .select()
            .single();

          if (purchErr) throw new Error(`Purchase: ${purchErr.message}`);

          // 4. Update Stock Ledger
          await supabaseAdmin.from("stock_ledgers").insert({
            product_id: product.id,
            transaction_type: "PURCHASE",
            weight: 0,
            quantity: data.selectionLines ? parseInt(data.selectionLines) : 0,
            reference_id: purchase.id,
            organization_id: organizationId,
          });
        }
      }
    }
  }

  return toCamelCase(updated);
}

export async function deleteLinesEntry(id: string, organizationId: string) {
  await supabaseAdmin.from("lines_entry_sublots").delete().eq("lines_entry_id", id);
  const { error } = await supabaseAdmin
    .from("lines_entry")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) throw new Error(error.message);
}
