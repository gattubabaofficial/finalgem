"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ShoppingCart, Loader2, AlertCircle, AlignJustify, ExternalLink } from "lucide-react";
import { formatDate, getCategoryLabel } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";
import Link from "next/link";

const WEIGHT_UNITS = ["G", "KG", "CT"];
const CATEGORIES = ["ROUGH", "READY_GOODS", "BY_ORDER"];

type Purchase = {
  id: string;
  lotId: string;
  lot: { lotNumber: string; category: string; itemName: string };
  date: string;
  itemName: string;
  supplier: string;
  grossWeight: number;
  netWeight: number;
  weightUnit: string;
  purchasePrice: number;
};

type LinesEntry = {
  id: string;
  lotNo: string;
  date: string;
  itemName: string;
  supplier: string;
  noOfLines: number | null;
  bunch: number;
};

export default function PurchasePage() {
  const [tab, setTab] = useState<"purchase" | "lines">("purchase");

  // ── Purchase state ──────────────────────────────────────────────
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseSaving, setPurchaseSaving] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const INITIAL_PURCHASE_FORM = {
    lotNo: "", date: new Date().toISOString().slice(0, 10), itemName: "", category: "ROUGH",
    supplierName: "", descriptionRef: "",
    grossWeight: "", lessWeight: "0", weightUnit: "G", size: "", shape: "", pieces: "",
    selectionWeight: "", selectionPieces: "",
    rejectionWeight: "", rejectionPieces: "", rejectionDate: "", rejectionStatus: "PENDING",
    purchasePrice: "",
  };
  const [purchaseForm, setPurchaseForm] = useState(INITIAL_PURCHASE_FORM);

  // ── Lines Entry state ────────────────────────────────────────────
  const [linesEntries, setLinesEntries] = useState<LinesEntry[]>([]);
  const [linesTotal, setLinesTotal] = useState(0);
  const [linesLoading, setLinesLoading] = useState(true);
  const [linesSearch, setLinesSearch] = useState("");
  const [showLinesForm, setShowLinesForm] = useState(false);
  const [linesSaving, setLinesSaving] = useState(false);
  const [linesError, setLinesError] = useState("");

  const INITIAL_LINES_FORM = {
    lotNo: "", date: new Date().toISOString().slice(0, 10),
    itemName: "", supplier: "", descriptionRef: "",
    noOfLines: "", lineLengthInch: "", lineLengthMm: "", lineLengthCm: "",
    selectionLines: "", selectionLengthInch: "", selectionLengthMm: "", selectionLengthCm: "",
    rejectionLines: "", rejectionLengthInch: "", rejectionLengthMm: "", rejectionLengthCm: "",
    bunch: "0",
    sublots: [] as any[],
  };
  const [linesForm, setLinesForm] = useState(INITIAL_LINES_FORM);

  // ── Purchase fetch ───────────────────────────────────────────────
  const fetchPurchases = useCallback(async () => {
    try {
      setPurchaseLoading(true);
      const r = await fetch(`/api/purchase?search=${purchaseSearch}`, { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        const arr = Array.isArray(data) ? data : data.purchases || [];
        setPurchases(arr);
        setPurchaseTotal(arr.length);
      }
    } catch (e) { console.error(e); }
    finally { setPurchaseLoading(false); }
  }, [purchaseSearch]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  // ── Lines Entry fetch ────────────────────────────────────────────
  const fetchLines = useCallback(async () => {
    try {
      setLinesLoading(true);
      const r = await fetch(`/api/lines-entry?search=${encodeURIComponent(linesSearch)}`, { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        const arr = Array.isArray(data) ? data : [];
        setLinesEntries(arr);
        setLinesTotal(arr.length);
      }
    } catch (e) { console.error(e); }
    finally { setLinesLoading(false); }
  }, [linesSearch]);

  useEffect(() => { fetchLines(); }, [fetchLines]);

  // ── Purchase helpers ─────────────────────────────────────────────
  const pNum = (v: string) => parseFloat(v || "0");
  const netWeight = pNum(purchaseForm.grossWeight) - pNum(purchaseForm.lessWeight);
  const netPieces = parseInt(purchaseForm.pieces || "0");
  const totalCostCalc = pNum(purchaseForm.purchasePrice);
  const netWeightG = purchaseForm.weightUnit === "KG" ? netWeight * 1000 : purchaseForm.weightUnit === "CT" ? netWeight * 0.2 : netWeight;
  const costPerGram = netWeightG > 0 ? totalCostCalc / netWeightG : 0;

  const pf = (k: string, v: string) => {
    setPurchaseForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "selectionWeight" || k === "grossWeight" || k === "lessWeight") {
        const nw = parseFloat(next.grossWeight || "0") - parseFloat(next.lessWeight || "0");
        const sw = parseFloat(next.selectionWeight || "0");
        if (sw <= nw) { next.rejectionWeight = (nw - sw).toFixed(3); setPurchaseError(""); }
        else setPurchaseError(`Selection weight (${sw}) exceeds net weight (${nw.toFixed(3)})`);
      }
      if (k === "selectionPieces" || k === "pieces") {
        const np = parseInt(next.pieces || "0"); const sp = parseInt(next.selectionPieces || "0");
        if (sp <= np) { next.rejectionPieces = (np - sp).toString(); setPurchaseError(""); }
        else setPurchaseError(`Selection pieces (${sp}) exceeds total pieces (${np})`);
      }
      return next;
    });
  };

  async function handlePurchaseSubmit(e: React.FormEvent) {
    e.preventDefault(); setPurchaseError("");
    const sw = pNum(purchaseForm.selectionWeight);
    const sp = parseInt(purchaseForm.selectionPieces || "0");
    if (sw > netWeight) { setPurchaseError(`Selection weight (${sw}) cannot exceed net weight (${netWeight.toFixed(3)})`); return; }
    if (sp > netPieces) { setPurchaseError(`Selection pieces (${sp}) cannot exceed total pieces (${netPieces})`); return; }
    setPurchaseSaving(true);
    const r = await fetch("/api/purchase", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...purchaseForm,
        grossWeight: parseFloat(purchaseForm.grossWeight),
        lessWeight: parseFloat(purchaseForm.lessWeight || "0"),
        pieces: purchaseForm.pieces ? parseInt(purchaseForm.pieces) : undefined,
        selectionWeight: purchaseForm.selectionWeight ? parseFloat(purchaseForm.selectionWeight) : undefined,
        selectionPieces: purchaseForm.selectionPieces ? parseInt(purchaseForm.selectionPieces) : undefined,
        rejectionWeight: purchaseForm.rejectionWeight ? parseFloat(purchaseForm.rejectionWeight) : undefined,
        rejectionPieces: purchaseForm.rejectionPieces ? parseInt(purchaseForm.rejectionPieces) : undefined,
        rejectionDate: purchaseForm.rejectionDate || null,
        rejectionStatus: purchaseForm.rejectionStatus || "PENDING",
        purchasePrice: parseFloat(purchaseForm.purchasePrice),
        supplierName: purchaseForm.supplierName,
      }),
    });
    if (r.ok) { setShowPurchaseForm(false); setPurchaseForm(INITIAL_PURCHASE_FORM); fetchPurchases(); }
    else { 
      const d = await r.json(); 
      if (d.error?.toLowerCase().includes("lot number")) setPurchaseError(`FIELD_LOTNO:${d.error}`);
      else setPurchaseError(d.error || "Failed to save purchase"); 
    }
    setPurchaseSaving(false);
  }

  // ── Lines helpers ────────────────────────────────────────────────
  const lf = (k: string, v: string) => {
    setLinesForm((prev) => {
      const next = { ...prev, [k]: v };
      
      if (k === "selectionLines" || k === "noOfLines") {
        const nl = parseInt(next.noOfLines || "0");
        const sl = parseInt(next.selectionLines || "0");
        if (sl <= nl) { next.rejectionLines = (nl - sl).toString(); setLinesError(""); }
        else setLinesError(`Selection lines (${sl}) exceeds total lines (${nl})`);
      }

      if (k === "bunch") {
        const count = Math.max(0, parseInt(v || "0") || 0);
        const newSublots = [...prev.sublots];
        if (count > newSublots.length) {
          for (let i = newSublots.length; i < count; i++) {
            newSublots.push({
              sublotNo: `${next.lotNo}-${i + 1}`,
              selectionLines: "", selectionLengthInch: "", selectionLengthMm: "", selectionLengthCm: "",
              rejectionLines: "", rejectionLengthInch: "", rejectionLengthMm: "", rejectionLengthCm: "",
            });
          }
        } else {
          newSublots.length = count;
        }
        next.sublots = newSublots;
      }

      if (k === "lotNo") {
        next.sublots = next.sublots.map((s, idx) => ({
          ...s,
          sublotNo: `${v}-${idx + 1}`
        }));
      }

      return next;
    });
  };

  const lfs = (idx: number, k: string, v: string) => {
    setLinesForm(prev => {
      const newSublots = [...prev.sublots];
      newSublots[idx] = { ...newSublots[idx], [k]: v };
      
      if (k === "selectionLines") {
        const nl = parseInt(prev.noOfLines || "0");
        const sl = parseInt(v || "0");
        if (sl <= nl) newSublots[idx].rejectionLines = (nl - sl).toString();
      }
      
      return { ...prev, sublots: newSublots };
    });
  };

  async function handleLinesSubmit(e: React.FormEvent) {
    e.preventDefault(); setLinesError("");
    setLinesSaving(true);
    const r = await fetch("/api/lines-entry", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...linesForm, 
        bunch: parseInt(linesForm.bunch || "0") || 0,
        sublots: linesForm.sublots 
      }),
    });
    if (r.ok) { setShowLinesForm(false); setLinesForm(INITIAL_LINES_FORM); fetchLines(); }
    else { 
      const d = await r.json(); 
      if (d.error?.toLowerCase().includes("lot number")) setLinesError(`FIELD_LOTNO:${d.error}`);
      else if (d.error?.toLowerCase().includes("sublot")) setLinesError(`FIELD_SUBLOT:${d.error}`);
      else setLinesError(d.error || "Failed to save lines entry"); 
    }
    setLinesSaving(false);
  }

  const checkLotExists = async (lotNo: string, isLines: boolean) => {
    if (!lotNo) return;
    try {
      const res = await fetch(`/api/validate/lot-exists?lotNo=${encodeURIComponent(lotNo)}`);
      const data = await res.json();
      if (data.exists) {
        if (isLines) setLinesError(`FIELD_LOTNO:This Lot No already exists.`);
        else setPurchaseError(`FIELD_LOTNO:This Lot No already exists.`);
      } else {
        if (isLines && linesError?.startsWith("FIELD_LOTNO:")) setLinesError("");
        if (!isLines && purchaseError?.startsWith("FIELD_LOTNO:")) setPurchaseError("");
      }
    } catch (e) { console.error(e); }
  };

  const bunch = parseInt(linesForm.bunch || "0") || 0;

  return (
    <div>
      {/* Header */}
      <div className="gem-page-header">
        <div>
          <h1>Purchase</h1>
          <p>{tab === "purchase" ? `${purchaseTotal} purchases` : `${linesTotal} lines entries`}</p>
        </div>
        <div>
          {tab === "purchase" ? (
            <button onClick={() => setShowPurchaseForm(true)} className="btn btn-primary">
              <Plus size={16} /> New Purchase
            </button>
          ) : (
            <button onClick={() => setShowLinesForm(true)} className="btn btn-primary">
              <Plus size={16} /> New Lines Entry
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: 0 }}>
          <div className="gem-tabs">
            <button className={`gem-tab ${tab === "purchase" ? "gem-tab--active" : ""}`} onClick={() => setTab("purchase")}>
              <ShoppingCart size={16} /> Purchase
            </button>
            <button className={`gem-tab ${tab === "lines" ? "gem-tab--active" : ""}`} onClick={() => setTab("lines")}>
              <AlignJustify size={16} /> Lines Entry
            </button>
          </div>
        </div>
      </div>

      {/* ── PURCHASE TAB ── */}
      {tab === "purchase" && (
        <>
          <div className="card mb-3" suppressHydrationWarning={true}>
            <div className="card-body p-3" suppressHydrationWarning={true}>
              <div className="input-group" style={{ maxWidth: "300px" }} suppressHydrationWarning={true}>
                <span className="input-group-text"><Search className="w-4 h-4" /></span>
                <input type="text" value={purchaseSearch} onChange={(e) => setPurchaseSearch(e.target.value)}
                  placeholder="Search lot no, supplier, item..." className="form-control" />
              </div>
            </div>
          </div>

          <div className="card flex-fill w-100" suppressHydrationWarning={true}>
            <div className="table-responsive" suppressHydrationWarning={true}>
              <table className="table table-hover my-0">
                <thead>
                  <tr>
                    <th>Lot No</th><th>Date</th><th>Supplier</th><th className="text-end">Item Name</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseLoading ? (
                    <tr><td colSpan={4} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                  ) : purchases.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-5 text-muted">No purchases yet.</td></tr>
                  ) : purchases.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/purchase/${p.id}`} className="text-decoration-none font-monospace fw-bold text-primary">
                          {p.lot?.lotNumber || "N/A"}
                        </Link>
                      </td>
                      <td>{formatDate(p.date)}</td>
                      <td>{p.supplier || "—"}</td>
                      <td className="text-end">{p.itemName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── LINES ENTRY TAB ── */}
      {tab === "lines" && (
        <>
          <div className="card mb-3">
            <div className="card-body p-3">
              <div className="input-group" style={{ maxWidth: "300px" }}>
                <span className="input-group-text"><Search className="w-4 h-4" /></span>
                <input type="text" value={linesSearch} onChange={(e) => setLinesSearch(e.target.value)}
                  placeholder="Search lot no, supplier, item..." className="form-control" />
              </div>
            </div>
          </div>

          <div className="card flex-fill w-100">
            <div className="table-responsive">
              <table className="table table-hover my-0">
                <thead>
                  <tr>
                    <th>Lot No</th><th>Date</th><th>Supplier</th><th className="text-center">Bunch</th><th className="text-end">No. of Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {linesLoading ? (
                    <tr><td colSpan={5} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                  ) : linesEntries.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No lines entries yet.</td></tr>
                  ) : linesEntries.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <Link href={`/lines-entry/${e.id}`} className="text-decoration-none font-monospace fw-bold text-primary d-inline-flex align-items-center gap-1">
                          {e.lotNo || "N/A"} <ExternalLink size={12} className="text-muted" />
                        </Link>
                      </td>
                      <td>{formatDate(e.date)}</td>
                      <td>{e.supplier || "—"}</td>
                      <td className="text-center">
                        <span className={`badge ${e.bunch > 0 ? "bg-success" : "bg-secondary"}`}>
                          {e.bunch > 0 ? `${e.bunch} Sublot${e.bunch > 1 ? "s" : ""}` : "None"}
                        </span>
                      </td>
                      <td className="text-end">{e.noOfLines ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          New Purchase Modal
      ════════════════════════════════════════════════════════════ */}
      {showPurchaseForm && (
        <ModalPortal>
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: "40px", width: "92%", maxWidth: "750px" }}>
              <div className="modal-content border-0 shadow text-sm">
                <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                  <h5 className="modal-title fw-bold m-0" style={{ fontSize: "1.1rem" }}>New Purchase Entry</h5>
                  <button type="button" className="btn-close m-0" style={{ fontSize: "0.75rem", opacity: 0.6 }}
                    onClick={() => { setShowPurchaseForm(false); setPurchaseForm(INITIAL_PURCHASE_FORM); setPurchaseError(""); }} />
                </div>
                <div className="modal-body pb-4">
                  <form id="purchaseForm" onSubmit={handlePurchaseSubmit}>
                    {purchaseError && (
                      <div className="alert alert-danger p-2 text-sm d-flex align-items-center mb-3">
                        <AlertCircle className="w-4 h-4 me-2" /> {purchaseError}
                      </div>
                    )}
                    {/* Basic Info */}
                    <div className="row g-3 mb-3">
                      <Field label="Lot No *" className="col-md-6" error={purchaseError?.startsWith("FIELD_LOTNO:") ? purchaseError.replace("FIELD_LOTNO:", "") : ""}>
                        <input required value={purchaseForm.lotNo} onChange={(e) => pf("lotNo", e.target.value)} onBlur={() => checkLotExists(purchaseForm.lotNo, false)} placeholder="Enter Lot#" className={`form-control ${purchaseError?.startsWith("FIELD_LOTNO:") ? "is-invalid" : ""}`} />
                      </Field>
                      <Field label="Date *" className="col-md-6"><input required type="date" value={purchaseForm.date} onChange={(e) => pf("date", e.target.value)} className="form-control" /></Field>
                      <Field label="Item Name" className="col-md-6"><input value={purchaseForm.itemName} onChange={(e) => pf("itemName", e.target.value)} placeholder="e.g. Amethyst" className="form-control" /></Field>
                      <Field label="Category" className="col-md-6">
                        <select value={purchaseForm.category} onChange={(e) => pf("category", e.target.value)} className="form-select">
                          {CATEGORIES.map((c) => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                        </select>
                      </Field>
                      <Field label="Supplier Name" className="col-md-12"><input value={purchaseForm.supplierName} onChange={(e) => pf("supplierName", e.target.value)} className="form-control" /></Field>
                      <Field label="Description / Reference" className="col-md-12"><input value={purchaseForm.descriptionRef} onChange={(e) => pf("descriptionRef", e.target.value)} className="form-control" /></Field>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <p className="small fw-bold text-muted text-uppercase mb-3">Received</p>
                      <div className="row g-3 mb-3">
                        <Field label="Weight Unit" className="col-md-4">
                          <select value={purchaseForm.weightUnit} onChange={(e) => pf("weightUnit", e.target.value)} className="form-select">
                            {WEIGHT_UNITS.map((u) => <option key={u}>{u}</option>)}
                          </select>
                        </Field>
                        <Field label="Gross Weight *" className="col-md-4"><input required type="number" step="0.001" value={purchaseForm.grossWeight} onChange={(e) => pf("grossWeight", e.target.value)} placeholder="0.000" className="form-control" /></Field>
                        <Field label="Less Weight" className="col-md-4"><input type="number" step="0.001" value={purchaseForm.lessWeight} onChange={(e) => pf("lessWeight", e.target.value)} placeholder="0.000" className="form-control" /></Field>
                      </div>
                      <div className="row g-3 mb-3">
                        <Field label="Size" className="col-md-4"><input value={purchaseForm.size} onChange={(e) => pf("size", e.target.value)} className="form-control" /></Field>
                        <Field label="Shape" className="col-md-4"><input value={purchaseForm.shape} onChange={(e) => pf("shape", e.target.value)} className="form-control" /></Field>
                        <Field label="Total Pieces" className="col-md-4"><input type="number" value={purchaseForm.pieces} onChange={(e) => pf("pieces", e.target.value)} className="form-control" /></Field>
                      </div>
                      <div className="p-3 bg-light rounded mt-2">
                        <span className="small text-muted">Net Weight (Auto): </span>
                        <strong className="text-primary">{netWeight.toFixed(3)} {purchaseForm.weightUnit}</strong>
                      </div>
                    </div>

                    <div className="row mt-4">
                      <div className="col-md-6 border-top pt-3">
                        <p className="small fw-bold text-success text-uppercase mb-3">Selection</p>
                        <div className="row g-3">
                          <Field label="Weight" className="col-12" error={pNum(purchaseForm.selectionWeight) > netWeight ? "Exceeds net weight" : ""}>
                            <input type="number" step="0.001" value={purchaseForm.selectionWeight} onChange={(e) => pf("selectionWeight", e.target.value)} placeholder="0.000" className={`form-control ${pNum(purchaseForm.selectionWeight) > netWeight ? "is-invalid" : ""}`} />
                          </Field>
                          <Field label="Pieces" className="col-12" error={parseInt(purchaseForm.selectionPieces || "0") > netPieces ? "Exceeds total" : ""}>
                            <input type="number" value={purchaseForm.selectionPieces} onChange={(e) => pf("selectionPieces", e.target.value)} className="form-control" />
                          </Field>
                        </div>
                      </div>
                      <div className="col-md-6 border-top pt-3">
                        <p className="small fw-bold text-danger text-uppercase mb-3">Rejection</p>
                        <div className="row g-3">
                          <Field label="Weight" className="col-12"><input type="number" step="0.001" value={purchaseForm.rejectionWeight} onChange={(e) => pf("rejectionWeight", e.target.value)} placeholder="0.000" className="form-control" /></Field>
                          <Field label="Pieces" className="col-12"><input type="number" value={purchaseForm.rejectionPieces} onChange={(e) => pf("rejectionPieces", e.target.value)} className="form-control" /></Field>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <p className="small fw-bold text-muted text-uppercase mb-3">Pricing</p>
                      <div className="row g-3">
                        <Field label="Purchase Price (₹) *" className="col-md-6">
                          <input required type="number" step="0.01" value={purchaseForm.purchasePrice} onChange={(e) => pf("purchasePrice", e.target.value)} className="form-control" />
                        </Field>
                        <div className="col-md-6 d-flex flex-column justify-content-end">
                          <div className="p-3 bg-light rounded">
                            <p className="small text-muted mb-1">Cost/gram: <strong className="text-primary">₹{costPerGram.toFixed(2)}</strong></p>
                            <p className="small text-muted mb-0">Total: <strong className="text-warning">₹{totalCostCalc.toFixed(2)}</strong></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end pt-3 border-top mt-3">
                      <button type="submit" form="purchaseForm" disabled={purchaseSaving} className="btn btn-primary d-flex align-items-center gap-2">
                        {purchaseSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {purchaseSaving ? "Saving..." : "Save Purchase"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ════════════════════════════════════════════════════════════
          New Lines Entry Modal
      ════════════════════════════════════════════════════════════ */}
      {showLinesForm && (
        <ModalPortal>
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: "40px", width: "92%", maxWidth: "780px" }}>
              <div className="modal-content border-0 shadow text-sm">
                <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                  <h5 className="modal-title fw-bold m-0" style={{ fontSize: "1.1rem" }}>
                    <AlignJustify className="w-4 h-4 me-2 d-inline-block align-middle" /> New Lines Entry
                  </h5>
                  <button type="button" className="btn-close m-0" style={{ fontSize: "0.75rem", opacity: 0.6 }}
                    onClick={() => { setShowLinesForm(false); setLinesForm(INITIAL_LINES_FORM); setLinesError(""); }} />
                </div>
                <div className="modal-body pb-4">
                  <form id="linesForm" onSubmit={handleLinesSubmit}>
                    {linesError && (
                      <div className="alert alert-danger p-2 text-sm d-flex align-items-center mb-3">
                        <AlertCircle className="w-4 h-4 me-2" /> {linesError}
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="row g-3 mb-3">
                      <Field label="Lot No *" className="col-md-6" error={linesError?.startsWith("FIELD_LOTNO:") ? linesError.replace("FIELD_LOTNO:", "") : ""}>
                        <input required value={linesForm.lotNo} onChange={(e) => lf("lotNo", e.target.value)} onBlur={() => checkLotExists(linesForm.lotNo, true)} placeholder="e.g. LE-001" className={`form-control ${linesError?.startsWith("FIELD_LOTNO:") ? "is-invalid" : ""}`} />
                      </Field>
                      <Field label="Date *" className="col-md-6"><input required type="date" value={linesForm.date} onChange={(e) => lf("date", e.target.value)} className="form-control" /></Field>
                      <Field label="Item Name" className="col-md-6"><input value={linesForm.itemName} onChange={(e) => lf("itemName", e.target.value)} className="form-control" /></Field>
                      <Field label="Supplier" className="col-md-6"><input value={linesForm.supplier} onChange={(e) => lf("supplier", e.target.value)} className="form-control" /></Field>
                      <Field label="Description / Reference" className="col-12"><input value={linesForm.descriptionRef} onChange={(e) => lf("descriptionRef", e.target.value)} className="form-control" /></Field>
                    </div>

                    {/* Bunch */}
                    <div className="mt-3 pt-3 border-top mb-3">
                      <p className="small fw-bold text-muted text-uppercase mb-2">Bunch (No. of Sublots)</p>
                      <div className="row g-3 align-items-center">
                        <Field label="Bunch count (0 = no sublots)" className="col-md-5">
                          <input type="number" min="0" max="50" value={linesForm.bunch} onChange={(e) => lf("bunch", e.target.value)} placeholder="0" className="form-control" />
                        </Field>
                        {bunch > 0 && (
                          <div className="col-md-7">
                            <div className="alert alert-info py-2 px-3 mb-0 small">
                              Specify details for <strong>{bunch} sublot{bunch > 1 ? "s" : ""}</strong> below.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sublots Grid */}
                    {bunch > 0 && (
                      <div className="mt-3 bg-light p-3 rounded-4 border">
                        <p className="small fw-bold text-primary text-uppercase mb-3">Sublot Entries ({bunch})</p>
                        <div className="row g-3">
                          {linesForm.sublots.map((s, idx) => (
                            <div key={idx} className="col-12 border-bottom pb-4 mb-2 last:border-0 last:pb-0 last:mb-0">
                              <div className="d-flex align-items-center gap-2 mb-3">
                                <span className="badge bg-primary rounded-pill px-3 py-2 font-monospace">Sublot {idx + 1}</span>
                                <div className="flex-grow-1">
                                  <input 
                                    className={`form-control form-control-sm w-auto fw-bold ${linesError?.startsWith("FIELD_SUBLOT:") ? "is-invalid" : ""}`} 
                                    value={s.sublotNo} 
                                    onChange={(e) => lfs(idx, "sublotNo", e.target.value)}
                                    onBlur={() => checkLotExists(s.sublotNo, true)}
                                    placeholder={`e.g. ${linesForm.lotNo}-${idx + 1}`}
                                  />
                                  {linesError?.startsWith("FIELD_SUBLOT:") && <div className="text-danger small mt-1">{linesError.replace("FIELD_SUBLOT:", "")}</div>}
                                </div>
                              </div>
                              <div className="row g-3">
                                <div className="col-md-6 border-end">
                                  <p className="text-success fw-bold text-uppercase mb-2" style={{ fontSize: "0.65rem" }}>Selection</p>
                                  <div className="row g-2">
                                    <div className="col-6"><label className="small text-muted mb-0">Lines</label><input type="number" className="form-control form-control-sm" value={s.selectionLines} onChange={(e) => lfs(idx, "selectionLines", e.target.value)} /></div>
                                    <div className="col-6"><label className="small text-muted mb-0">Inch</label><input type="number" step="0.001" className="form-control form-control-sm" value={s.selectionLengthInch} onChange={(e) => lfs(idx, "selectionLengthInch", e.target.value)} /></div>
                                    <div className="col-6"><label className="small text-muted mb-0">MM</label><input type="number" step="0.001" className="form-control form-control-sm" value={s.selectionLengthMm} onChange={(e) => lfs(idx, "selectionLengthMm", e.target.value)} /></div>
                                    <div className="col-6"><label className="small text-muted mb-0">CM</label><input type="number" step="0.001" className="form-control form-control-sm" value={s.selectionLengthCm} onChange={(e) => lfs(idx, "selectionLengthCm", e.target.value)} /></div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <p className="text-danger fw-bold text-uppercase mb-2" style={{ fontSize: "0.65rem" }}>Rejection</p>
                                  <div className="row g-2">
                                    <div className="col-6"><label className="small text-muted mb-0">Lines</label><input type="number" className="form-control form-control-sm" value={s.rejectionLines} onChange={(e) => lfs(idx, "rejectionLines", e.target.value)} /></div>
                                    <div className="col-6"><label className="small text-muted mb-0">Inch</label><input type="number" step="0.001" className="form-control form-control-sm" value={s.rejectionLengthInch} onChange={(e) => lfs(idx, "rejectionLengthInch", e.target.value)} /></div>
                                    <div className="col-6"><label className="small text-muted mb-0">MM</label><input type="number" step="0.001" className="form-control form-control-sm" value={s.rejectionLengthMm} onChange={(e) => lfs(idx, "rejectionLengthMm", e.target.value)} /></div>
                                    <div className="col-6"><label className="small text-muted mb-0">CM</label><input type="number" step="0.001" className="form-control form-control-sm" value={s.rejectionLengthCm} onChange={(e) => lfs(idx, "rejectionLengthCm", e.target.value)} /></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}



                    <div className="d-flex justify-content-end pt-3 border-top mt-4">
                      <button type="submit" form="linesForm" disabled={linesSaving} className="btn btn-primary d-flex align-items-center gap-2">
                        {linesSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {linesSaving ? "Saving..." : bunch > 0 ? `Save & Create ${bunch} Sublot${bunch > 1 ? "s" : ""}` : "Save Entry"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

function Field({ label, children, className = "", error }: {
  label: string; children: React.ReactNode; className?: string; required?: boolean; error?: string;
}) {
  return (
    <div className={className}>
      <label className="form-label mb-1">{label}</label>
      {children}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
