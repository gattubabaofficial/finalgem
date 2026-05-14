import { supabaseAdmin } from "@/lib/supabaseClient";
import { toCamelCase } from "@/lib/utils";

// --- Safe Parsing Helpers to Prevent Supabase Integer/Float Errors ---
const safeInt = (v: any) => {
  if (v === null || v === undefined || v === "" || String(v).trim() === "") return null;
  const p = parseInt(String(v), 10);
  return isNaN(p) ? null : p;
};

const safeFloat = (v: any) => {
  if (v === null || v === undefined || v === "" || String(v).trim() === "") return null;
  const p = parseFloat(String(v));
  return isNaN(p) ? null : p;
};

const safeFloatZero = (v: any) => {
  const p = safeFloat(v);
  return p === null ? 0 : p;
};

const safeIntZero = (v: any) => {
  const p = safeInt(v);
  return p === null ? 0 : p;
};

// --- Universal cleaner for empty strings ---
const cleanEmptyStrings = (obj: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    cleaned[k] = v === "" ? null : v;
  }
  return cleaned;
};

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

  const bunch = Math.max(0, safeIntZero(data.bunch));

  const gw = safeFloatZero(data.grossWeight);
  const lw = safeFloatZero(data.lessWeight);
  if (lw < 0) throw new Error("Less weight cannot be negative.");
  if (lw > gw && gw > 0) throw new Error("Less weight cannot be greater than gross weight.");
  if (lw > 0 && gw === 0) throw new Error("Gross weight must be entered if less weight is provided.");

  // 1. Create the master lines entry
  const { data: entry, error: entryErr } = await supabaseAdmin
    .from("lines_entry")
    .insert(cleanEmptyStrings({
      lot_no: data.lotNo,
      date: data.date || new Date().toISOString(),
      item_name: data.itemName,
      supplier: data.supplier,
      description_ref: data.descriptionRef,
      gross_weight: gw,
      less_weight: lw,
      weight_unit: data.weightUnit || 'G',
      size: data.size,
      shape: data.shape,
      no_of_lines: safeInt(data.noOfLines),
      line_length_inch: safeFloat(data.lineLengthInch),
      line_length_mm: safeFloat(data.lineLengthMm),
      line_length_cm: safeFloat(data.lineLengthCm),
      selection_lines: safeInt(data.selectionLines),
      selection_length_inch: safeFloat(data.selectionLengthInch),
      selection_length_mm: safeFloat(data.selectionLengthMm),
      selection_length_cm: safeFloat(data.selectionLengthCm),
      rejection_lines: safeInt(data.rejectionLines),
      rejection_length_inch: safeFloat(data.rejectionLengthInch),
      rejection_length_mm: safeFloat(data.rejectionLengthMm),
      rejection_length_cm: safeFloat(data.rejectionLengthCm),
      bunch,
      organization_id: organizationId,
    }))
    .select()
    .single();

  if (entryErr) throw new Error(entryErr.message);

  // 2. Create N individual sublot rows
  if (bunch > 0) {
    for (let i = 1; i <= bunch; i++) {
      const sub = (data.sublots && data.sublots[i - 1]) || {};
      
      const subGw = safeFloatZero(sub.grossWeight);
      const subLw = safeFloatZero(sub.lessWeight);
      if (subLw < 0) throw new Error(`Sublot ${i}: Less weight cannot be negative.`);
      if (subLw > subGw && subGw > 0) throw new Error(`Sublot ${i}: Less weight cannot be greater than gross weight.`);
      if (subLw > 0 && subGw === 0) throw new Error(`Sublot ${i}: Gross weight must be entered if less weight is provided.`);

      const { error: slErr } = await supabaseAdmin.from("lines_entry_sublots").insert(cleanEmptyStrings({
        lines_entry_id: entry.id,
        sublot_no: sub.sublotNo || null,
        sublot_index: i,
        selection_lines: safeInt(sub.selectionLines),
        selection_length_inch: safeFloat(sub.selectionLengthInch),
        selection_length_mm: safeFloat(sub.selectionLengthMm),
        selection_length_cm: safeFloat(sub.selectionLengthCm),
        rejection_lines: safeInt(sub.rejectionLines),
        rejection_length_inch: safeFloat(sub.rejectionLengthInch),
        rejection_length_mm: safeFloat(sub.rejectionLengthMm),
        rejection_length_cm: safeFloat(sub.rejectionLengthCm),
        gross_weight: subGw,
        less_weight: subLw,
        weight_unit: sub.weightUnit || 'G',
        size: sub.size,
        shape: sub.shape,
        sent_to_finished_goods: false,
        organization_id: organizationId,
      }));
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
    result.sublots.sort((a: any, b: any) => (safeInt(a.sublotIndex) ?? 0) - (safeInt(b.sublotIndex) ?? 0));
  }
  return result;
}

export async function updateLinesEntry(id: string, data: any, organizationId: string) {
  const bunch = Math.max(0, safeIntZero(data.bunch));

  const gw = safeFloatZero(data.grossWeight);
  const lw = safeFloatZero(data.lessWeight);
  if (lw < 0) throw new Error("Less weight cannot be negative.");
  if (lw > gw && gw > 0) throw new Error("Less weight cannot be greater than gross weight.");
  if (lw > 0 && gw === 0) throw new Error("Gross weight must be entered if less weight is provided.");

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("lines_entry")
    .update(cleanEmptyStrings({
      lot_no: data.lotNo,
      date: data.date,
      item_name: data.itemName,
      supplier: data.supplier,
      description_ref: data.descriptionRef,
      gross_weight: gw,
      less_weight: lw,
      weight_unit: data.weightUnit || 'G',
      size: data.size,
      shape: data.shape,
      no_of_lines: safeInt(data.noOfLines),
      line_length_inch: safeFloat(data.lineLengthInch),
      line_length_mm: safeFloat(data.lineLengthMm),
      line_length_cm: safeFloat(data.lineLengthCm),
      selection_lines: safeInt(data.selectionLines),
      selection_length_inch: safeFloat(data.selectionLengthInch),
      selection_length_mm: safeFloat(data.selectionLengthMm),
      selection_length_cm: safeFloat(data.selectionLengthCm),
      rejection_lines: safeInt(data.rejectionLines),
      rejection_length_inch: safeFloat(data.rejectionLengthInch),
      rejection_length_mm: safeFloat(data.rejectionLengthMm),
      rejection_length_cm: safeFloat(data.rejectionLengthCm),
      bunch,
    }))
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
  const gw = safeFloatZero(data.grossWeight);
  const lw = safeFloatZero(data.lessWeight);
  if (lw < 0) throw new Error("Less weight cannot be negative.");
  if (lw > gw && gw > 0) throw new Error("Less weight cannot be greater than gross weight.");
  if (lw > 0 && gw === 0) throw new Error("Gross weight must be entered if less weight is provided.");

  const { data: updated, error } = await supabaseAdmin
    .from("lines_entry_sublots")
    .update(cleanEmptyStrings({
      // User-editable sublot number
      sublot_no: data.sublotNo ?? undefined,
      // Selection
      selection_lines: safeInt(data.selectionLines),
      selection_length_inch: safeFloat(data.selectionLengthInch),
      selection_length_mm: safeFloat(data.selectionLengthMm),
      selection_length_cm: safeFloat(data.selectionLengthCm),
      // Rejection
      rejection_lines: safeInt(data.rejectionLines),
      rejection_length_inch: safeFloat(data.rejectionLengthInch),
      rejection_length_mm: safeFloat(data.rejectionLengthMm),
      rejection_length_cm: safeFloat(data.rejectionLengthCm),
      // Physical specs
      gross_weight: gw,
      less_weight: lw,
      weight_unit: data.weightUnit || 'G',
      size: data.size,
      shape: data.shape,
      // FG flag
      sent_to_finished_goods: data.sentToFinishedGoods ?? false,
    }))
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
            gross_weight: safeFloatZero(data.grossWeight),
            less_weight: safeFloatZero(data.lessWeight),
            net_weight: safeFloatZero(data.grossWeight) - safeFloatZero(data.lessWeight),
            weight_unit: data.weightUnit || "G",
            size: data.size,
            shape: data.shape,
            lines: safeIntZero(data.selectionLines),
            line_length: safeFloatZero(data.selectionLengthInch),
            quantity: safeIntZero(data.selectionLines),
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
              gross_weight: safeFloatZero(data.grossWeight),
              less_weight: safeFloatZero(data.lessWeight),
              net_weight: safeFloatZero(data.grossWeight) - safeFloatZero(data.lessWeight),
              weight_unit: data.weightUnit || "G",
              size: data.size,
              shape: data.shape,
              lines: safeIntZero(data.selectionLines),
              line_length: safeFloatZero(data.selectionLengthInch),
              pieces: safeIntZero(data.selectionLines),
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
            weight: safeFloatZero(data.grossWeight) - safeFloatZero(data.lessWeight),
            quantity: safeIntZero(data.selectionLines),
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
