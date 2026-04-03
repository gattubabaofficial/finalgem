"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import {
  ArrowLeft, Edit, Save, Trash2, Loader2, AlertCircle, CheckCircle2,
  ChevronRight, AlignJustify, Package, Info, User, Calendar,
  Layers, Hash, ExternalLink, Scale
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const WEIGHT_UNITS = ["G", "KG", "CT"];

interface Params { id: string; }

type Sublot = {
  id: string;
  sublotNo: string;
  sublotIndex: number;
  selectionLines: number | null;
  selectionLengthInch: number | null;
  selectionLengthMm: number | null;
  selectionLengthCm: number | null;
  rejectionLines: number | null;
  rejectionLengthInch: number | null;
  rejectionLengthMm: number | null;
  rejectionLengthCm: number | null;
  sentToFinishedGoods: boolean;
};



type SublotEdit = {
  sublotNo: string;
  selectionLines: string;
  selectionLengthInch: string;
  selectionLengthMm: string;
  selectionLengthCm: string;
  rejectionLines: string;
  rejectionLengthInch: string;
  rejectionLengthMm: string;
  rejectionLengthCm: string;
};

const blankEdit: SublotEdit = {
  sublotNo: "",
  selectionLines: "", selectionLengthInch: "", selectionLengthMm: "", selectionLengthCm: "",
  rejectionLines: "", rejectionLengthInch: "", rejectionLengthMm: "", rejectionLengthCm: "",
};

export default function LinesEntryDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useRole();

  const [loading, setLoading] = useState(true);
  const [masterSaving, setMasterSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    lotNo: "", date: "", itemName: "", supplier: "", descriptionRef: "",
    noOfLines: "", lineLengthInch: "", lineLengthMm: "", lineLengthCm: "",
    selectionLines: "", selectionLengthInch: "", selectionLengthMm: "", selectionLengthCm: "",
    rejectionLines: "", rejectionLengthInch: "", rejectionLengthMm: "", rejectionLengthCm: "",
    bunch: "0",
    grossWeight: "0", lessWeight: "0", weightUnit: "G", size: "", shape: ""
  });

  const [sublots, setSublots] = useState<Sublot[]>([]);
  // Each sublot always has its own live edit buffer — no toggle required
  const [sublotEdits, setSublotEdits] = useState<Record<string, SublotEdit>>({});
  const [sublotSaving, setSublotSaving] = useState<Record<string, boolean>>({});
  const [sublotSaved, setSublotSaved] = useState<Record<string, boolean>>({});
  const [sublotError, setSublotError] = useState<Record<string, string>>({});
  const [fgSending, setFgSending] = useState<Record<string, boolean>>({});

  // ── Fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchEntry() {
      try {
        setLoading(true);
        const r = await fetch(`/api/lines-entry/${id}`);
        if (!r.ok) throw new Error("Failed to fetch lines entry");
        const data = await r.json();

        setForm({
          lotNo: data.lotNo || "",
          date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
          itemName: data.itemName || "",
          supplier: data.supplier || "",
          descriptionRef: data.descriptionRef || "",
          noOfLines: data.noOfLines?.toString() || "",
          lineLengthInch: data.lineLengthInch?.toString() || "",
          lineLengthMm: data.lineLengthMm?.toString() || "",
          lineLengthCm: data.lineLengthCm?.toString() || "",
          selectionLines: data.selectionLines?.toString() || "",
          selectionLengthInch: data.selectionLengthInch?.toString() || "",
          selectionLengthMm: data.selectionLengthMm?.toString() || "",
          selectionLengthCm: data.selectionLengthCm?.toString() || "",
          rejectionLines: data.rejectionLines?.toString() || "",
          rejectionLengthInch: data.rejectionLengthInch?.toString() || "",
          rejectionLengthMm: data.rejectionLengthMm?.toString() || "",
          rejectionLengthCm: data.rejectionLengthCm?.toString() || "",
          bunch: data.bunch?.toString() || "0",
          grossWeight: data.grossWeight?.toString() || "0",
          lessWeight: data.lessWeight?.toString() || "0",
          weightUnit: data.weightUnit || "G",
          size: data.size || "",
          shape: data.shape || ""
        });

        const sls: Sublot[] = (data.sublots || []).map((s: any) => ({
          id: s.id,
          sublotNo: s.sublotNo || "",
          sublotIndex: s.sublotIndex ?? 0,
          selectionLines: s.selectionLines ?? null,
          selectionLengthInch: s.selectionLengthInch ?? null,
          selectionLengthMm: s.selectionLengthMm ?? null,
          selectionLengthCm: s.selectionLengthCm ?? null,
          rejectionLines: s.rejectionLines ?? null,
          rejectionLengthInch: s.rejectionLengthInch ?? null,
          rejectionLengthMm: s.rejectionLengthMm ?? null,
          rejectionLengthCm: s.rejectionLengthCm ?? null,
          sentToFinishedGoods: s.sentToFinishedGoods ?? false,
        }));
        setSublots(sls);

        // Initialise all edit buffers with current saved values
        const edits: Record<string, SublotEdit> = {};
        sls.forEach((sl) => {
          edits[sl.id] = {
            sublotNo: sl.sublotNo ?? "",
            selectionLines: sl.selectionLines?.toString() ?? "",
            selectionLengthInch: sl.selectionLengthInch?.toString() ?? "",
            selectionLengthMm: sl.selectionLengthMm?.toString() ?? "",
            selectionLengthCm: sl.selectionLengthCm?.toString() ?? "",
            rejectionLines: sl.rejectionLines?.toString() ?? "",
            rejectionLengthInch: sl.rejectionLengthInch?.toString() ?? "",
            rejectionLengthMm: sl.rejectionLengthMm?.toString() ?? "",
            rejectionLengthCm: sl.rejectionLengthCm?.toString() ?? "",
          };
        });
        setSublotEdits(edits);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEntry();
  }, [id]);

  // ── Master form field helper ──────────────────────────────────────
  const f = (k: string, v: string) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "selectionLines" || k === "noOfLines") {
        const nl = parseInt(next.noOfLines || "0");
        const sl = parseInt(next.selectionLines || "0");
        if (sl <= nl) next.rejectionLines = (nl - sl).toString();
      }
      return next;
    });
  };

  // ── Sublot field helper — updates live buffer ─────────────────────
  const se = (sublotId: string, k: keyof SublotEdit, v: string) => {
    setSublotEdits((prev) => {
      const current = prev[sublotId] ?? { ...blankEdit };
      const next = { ...current, [k]: v };
      // Auto-fill rejection lines = master total - selection
      if (k === "selectionLines") {
        const nl = parseInt(form.noOfLines || "0");
        const sl = parseInt(v || "0");
        if (!isNaN(nl) && !isNaN(sl) && sl <= nl) {
          next.rejectionLines = (nl - sl).toString();
        }
      }
      return { ...prev, [sublotId]: next };
    });
    // Clear saved flash when editing
    setSublotSaved((p) => ({ ...p, [sublotId]: false }));
  };

  // ── Save one sublot ───────────────────────────────────────────────
  async function saveSublot(sublotId: string) {
    setSublotSaving((p) => ({ ...p, [sublotId]: true }));
    setSublotError((p) => ({ ...p, [sublotId]: "" }));
    setSublotSaved((p) => ({ ...p, [sublotId]: false }));
    try {
      const body = sublotEdits[sublotId] ?? blankEdit;
      const r = await fetch(`/api/lines-entry/sublot/${sublotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Failed to save sublot");
      const updated = await r.json();
      setSublots((prev) => prev.map((sl) =>
        sl.id === sublotId ? {
          ...sl,
          sublotNo: updated.sublotNo ?? sl.sublotNo,
          selectionLines: updated.selectionLines ?? sl.selectionLines,
          selectionLengthInch: updated.selectionLengthInch ?? sl.selectionLengthInch,
          selectionLengthMm: updated.selectionLengthMm ?? sl.selectionLengthMm,
          selectionLengthCm: updated.selectionLengthCm ?? sl.selectionLengthCm,
          rejectionLines: updated.rejectionLines ?? sl.rejectionLines,
          rejectionLengthInch: updated.rejectionLengthInch ?? sl.rejectionLengthInch,
          rejectionLengthMm: updated.rejectionLengthMm ?? sl.rejectionLengthMm,
          rejectionLengthCm: updated.rejectionLengthCm ?? sl.rejectionLengthCm,
        } : sl
      ));
      setSublotSaved((p) => ({ ...p, [sublotId]: true }));
      setTimeout(() => setSublotSaved((p) => ({ ...p, [sublotId]: false })), 2500);
    } catch (err: any) {
      if (err.message.toLowerCase().includes("sublot")) {
        setSublotError((p) => ({ ...p, [sublotId]: `FIELD_SUBLOT:${err.message}` }));
      } else {
        setSublotError((p) => ({ ...p, [sublotId]: err.message }));
      }
    } finally {
      setSublotSaving((p) => ({ ...p, [sublotId]: false }));
    }
  }

  // ── Send sublot selection → Finished Goods ────────────────────────
  async function sendToFG(sl: Sublot) {
    setFgSending((p) => ({ ...p, [sl.id]: true }));
    try {
      const r = await fetch(`/api/lines-entry/sublot/${sl.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...(sublotEdits[sl.id] ?? blankEdit), 
          sentToFinishedGoods: true,
          itemName: form.itemName,
          supplier: form.supplier,
          descriptionRef: form.descriptionRef
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Failed");
      setSublots((prev) => prev.map((s) => s.id === sl.id ? { ...s, sentToFinishedGoods: true } : s));
      setSuccess(`Sublot ${sl.sublotNo} sent to Finished Goods ✓`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFgSending((p) => ({ ...p, [sl.id]: false }));
    }
  }

  // ── Master save ───────────────────────────────────────────────────
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMasterSaving(true);
    try {
      const r = await fetch(`/api/lines-entry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, bunch: parseInt(form.bunch || "0") || 0 }),
      });
      if (!r.ok) {
        const d = await r.json();
        if (d.error?.toLowerCase().includes("lot no")) throw new Error(`FIELD_LOTNO:${d.error}`);
        throw new Error(d.error || "Failed to update");
      }
      setSuccess("Entry updated!");
      setIsEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMasterSaving(false);
    }
  }

  const checkLotExists = async (lotNo: string, isSublot = false, sublotId?: string) => {
    if (!lotNo) return;
    try {
      // If editing existing, allow it! (Simple check: don't flag if it's the current one)
      if (!isSublot && lotNo === originalLotNo) return; 
      
      const res = await fetch(`/api/validate/lot-exists?lotNo=${encodeURIComponent(lotNo)}`);
      const data = await res.json();
      if (data.exists) {
        if (isSublot && sublotId) {
          setSublotError(p => ({ ...p, [sublotId]: `FIELD_SUBLOT:This name already exists.` }));
        } else {
          setError(`FIELD_LOTNO:This Lot No already exists.`);
        }
      } else {
        if (!isSublot && error?.startsWith("FIELD_LOTNO:")) setError("");
        if (isSublot && sublotId && sublotError[sublotId]?.startsWith("FIELD_SUBLOT:")) {
           setSublotError(p => ({ ...p, [sublotId]: "" }));
        }
      }
    } catch (e) { console.error(e); }
  };

  const [originalLotNo, setOriginalLotNo] = useState("");
  useEffect(() => { if (form.lotNo && !originalLotNo) setOriginalLotNo(form.lotNo); }, [form.lotNo]);

  // ── Delete ────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm("Delete this entry and all its sublots? Cannot be undone.")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/lines-entry/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      router.push("/purchase");
    } catch (err: any) { setError(err.message); setDeleting(false); }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" size={40} />
    </div>
  );

  const bunch = parseInt(form.bunch || "0") || 0;

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5" suppressHydrationWarning={true}>
      {/* Premium Breadcrumb/Header */}
      <div className="bg-primary-gradient shadow-lg rounded-5 mx-4 mt-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-3 pb-3 border border-white border-opacity-10">
        <div className="d-flex align-items-center gap-4">
          <Link href="/purchase" className="gem-back-button" aria-label="Go back">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill font-mono shadow-sm border border-white border-opacity-20" style={{ fontSize: '0.75rem' }}>
                {form.lotNo}
              </span>
              <ChevronRight className="text-white text-opacity-50" size={16} />
              <span className="text-white text-opacity-80 small fw-bold tracking-wide">Lines Entry Detail</span>
            </div>
            <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-sm">
              {form.itemName || "Lines Details"}
            </h3>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3 pe-md-2">
          {!isEditMode ? (
            <>
              {isAdmin && (
                <button onClick={() => setIsEditMode(true)}
                  className="btn bg-white text-primary d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-sm fw-extrabold border-0 transition-all hover-scale">
                  <Edit size={18} /> Edit Info
                </button>
              )}
              {isAdmin && (
                <button onClick={handleDelete} disabled={deleting}
                  className="btn btn-danger text-white d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-sm border-0 transition-all">
                  {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Remove
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setIsEditMode(false)} className="btn btn-link text-white text-opacity-80 text-decoration-none px-4 fw-bold hover-text-white">Discard Changes</button>
              <button type="submit" form="detailForm" disabled={masterSaving}
                className="btn bg-white text-indigo d-flex align-items-center gap-2 px-5 py-3 rounded-4 shadow-sm border-0 transition-all">
                {masterSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Apply Updates
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4 d-flex align-items-center gap-3 mb-5 mx-4 fade show">
          <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="fw-bold">Action Required</div>
            <div className="small opacity-75">{error}</div>
          </div>
        </div>
      )}
      {success && (
        <div className="alert alert-success border-0 shadow-sm rounded-4 p-4 d-flex align-items-center gap-3 mb-5 mx-4 fade show">
          <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="fw-bold">Success</div>
            <div className="small opacity-75">{success}</div>
          </div>
        </div>
      )}

      <div className="px-4">
        <form id="detailForm" onSubmit={handleUpdate}>
          <div className="row g-4">
            {/* ── LEFT: Master info card (now in 8 column layout) ── */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-premium rounded-5 overflow-hidden mb-4 bg-white">
                <div className="card-body p-5">
                  <div className="d-flex align-items-center gap-3 mb-5">
                    <div className="p-3 bg-primary-subtle rounded-4 text-primary shadow-sm">
                      <Info size={24} />
                    </div>
                    <h4 className="fw-extrabold m-0 text-navy uppercase tracking-widest">Entry Information</h4>
                  </div>
                  <div className="row g-5">
                    <div className="col-md-6">
                      <Field label="Lot Identifier" icon={<Hash size={18} />}>
                        <input 
                          readOnly={!isEditMode}
                          value={form.lotNo} 
                          onChange={(e) => f("lotNo", e.target.value)} 
                          onBlur={() => checkLotExists(form.lotNo)}
                          className={`form-control-minimal fw-bold fs-5 ${isEditMode ? 'form-control-edit' : ''} ${error?.startsWith("FIELD_LOTNO:") ? "is-invalid" : ""}`} 
                        />
                        {error?.startsWith("FIELD_LOTNO:") && <div className="text-danger small mt-1">{error.replace("FIELD_LOTNO:", "")}</div>}
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field label="Entry Date" icon={<Calendar size={18} />}>
                        <input 
                          type={isEditMode ? "date" : "text"}
                          readOnly={!isEditMode}
                          value={form.date} 
                          onChange={(e) => f("date", e.target.value)} 
                          className={`form-control-minimal fw-semibold ${isEditMode ? 'form-control-edit' : ''}`} 
                        />
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field label="Item Specification" icon={<AlignJustify size={18} />}>
                        <input 
                          readOnly={!isEditMode}
                          value={form.itemName} 
                          onChange={(e) => f("itemName", e.target.value)} 
                          className={`form-control-minimal text-dark fw-medium ${isEditMode ? 'form-control-edit' : ''}`} 
                        />
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field label="Sourcing Partner" icon={<User size={18} />}>
                        <input 
                          readOnly={!isEditMode}
                          value={form.supplier} 
                          onChange={(e) => f("supplier", e.target.value)} 
                          className={`form-control-minimal text-dark fw-medium ${isEditMode ? 'form-control-edit' : ''}`} 
                        />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field label="Internal Reference / Memo" icon={<Info size={18} />}>
                        <textarea 
                          readOnly={!isEditMode}
                          rows={3}
                          value={form.descriptionRef} 
                          onChange={(e) => f("descriptionRef", e.target.value)} 
                          className={`form-control-minimal text-muted-800 ${isEditMode ? 'form-control-edit' : ''}`} 
                          placeholder="..."
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sublots Section */}
              <div className="d-flex align-items-center gap-3 mb-4 mt-2">
                <div className="p-2 bg-dark rounded-3 text-white shadow-sm">
                  <AlignJustify size={20} />
                </div>
                <h4 className="fw-extrabold m-0 text-navy uppercase tracking-wider">Sublot Distribution ({sublots.length})</h4>
              </div>

              {sublots.length === 0 ? (
                <div className="card border-0 shadow-premium rounded-5 bg-white mb-4 overflow-hidden">
                  <div className="card-body p-5 text-center text-muted">
                    <AlignJustify size={48} className="mb-3 opacity-25" />
                    <p className="mb-0 fw-bold">No sublots distributed yet.</p>
                    <p className="small opacity-75">Increase 'Bunch Count' in metrics and save to generate sublots.</p>
                  </div>
                </div>
              ) : (
                <div className="row g-4">
                  {sublots.map((sl) => {
                    const edit = sublotEdits[sl.id] ?? blankEdit;
                    const saving = sublotSaving[sl.id] ?? false;
                    const saved = sublotSaved[sl.id] ?? false;
                    const slErr = sublotError[sl.id] ?? "";
                    const sending = fgSending[sl.id] ?? false;

                    return (
                      <div key={sl.id} className="col-12 col-xl-6">
                        <div className={`card h-100 border-0 shadow-premium rounded-5 overflow-hidden transition-all ${sl.sentToFinishedGoods ? "border-2 border-emerald" : "bg-white"}`}>
                          <div className={`p-4 d-flex align-items-center justify-content-between ${sl.sentToFinishedGoods ? "bg-emerald-subtle-25" : "bg-light bg-opacity-50"}`}>
                             <div className="d-flex align-items-center gap-3">
                               <div className="bg-dark text-white px-3 py-1 rounded-pill font-mono fw-extrabold shadow-sm" style={{ fontSize: '0.75rem' }}>
                                 {edit.sublotNo || `SUBLOT-${sl.sublotIndex}`}
                               </div>
                               {sl.sentToFinishedGoods && (
                                 <span className="badge bg-emerald text-white d-flex align-items-center gap-1 rounded-pill px-3 py-1 shadow-sm" style={{ fontSize: '0.65rem' }}>
                                   <Package size={10} /> In Finished Goods
                                 </span>
                               )}
                             </div>
                             <div className="d-flex gap-2">
                                <button type="button" onClick={() => saveSublot(sl.id)} disabled={saving} className="btn btn-sm btn-dark rounded-pill px-3 fw-bold d-flex align-items-center gap-2">
                                  {saving ? <Loader2 size={12} className="animate-spin" /> : (saved ? <CheckCircle2 size={12} className="text-emerald" /> : <Save size={12} />)}
                                  {saving ? "Saving" : (saved ? "Saved" : "Save")}
                                </button>
                                {!sl.sentToFinishedGoods && (
                                  <button type="button" onClick={() => sendToFG(sl)} disabled={sending} className="btn btn-sm btn-emerald text-white rounded-pill px-3 fw-bold d-flex align-items-center gap-2 shadow-sm">
                                    {sending ? <Loader2 size={12} className="animate-spin" /> : <Package size={12} />}
                                    → FG
                                  </button>
                                )}
                             </div>
                          </div>
                          <div className="card-body p-4">
                             {/* Editing Sublot No */}
                             <div className="mb-4">
                                <label className="text-secondary small fw-bold uppercase tracking-widest mb-2 d-block opacity-75" style={{ fontSize: '0.6rem' }}>Sublot Identifier</label>
                                <input 
                                  value={edit.sublotNo} 
                                  onChange={(e) => se(sl.id, "sublotNo", e.target.value)}
                                  onBlur={() => checkLotExists(edit.sublotNo, true, sl.id)}
                                  className={`form-control form-control-sm form-control-edit font-mono fw-bold ${slErr?.startsWith("FIELD_SUBLOT:") ? "is-invalid" : ""}`}
                                />
                                {slErr?.startsWith("FIELD_SUBLOT:") && <div className="text-danger mt-1 fw-bold" style={{ fontSize: '0.65rem' }}>{slErr.replace("FIELD_SUBLOT:", "")}</div>}
                             </div>

                             <div className="row g-3">
                               <div className="col-md-6 border-end border-light">
                                  <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="p-1 bg-emerald rounded-circle text-white"><CheckCircle2 size={10} /></div>
                                    <span className="text-emerald fw-extrabold uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>Selection</span>
                                  </div>
                                  <div className="row g-2">
                                    <div className="col-6"><ModernSmallField label="Lines" value={edit.selectionLines} isEdit={true} onChange={(v) => se(sl.id, "selectionLines", v)} accent="emerald" /></div>
                                    <div className="col-6"><ModernSmallField label="Inch" value={edit.selectionLengthInch} isEdit={true} onChange={(v) => se(sl.id, "selectionLengthInch", v)} accent="emerald" /></div>
                                    <div className="col-6"><ModernSmallField label="MM" value={edit.selectionLengthMm} isEdit={true} onChange={(v) => se(sl.id, "selectionLengthMm", v)} accent="emerald" /></div>
                                    <div className="col-6"><ModernSmallField label="CM" value={edit.selectionLengthCm} isEdit={true} onChange={(v) => se(sl.id, "selectionLengthCm", v)} accent="emerald" /></div>
                                  </div>
                               </div>
                               <div className="col-md-6">
                                  <div className="d-flex align-items-center gap-2 mb-3">
                                    <div className="p-1 bg-rose rounded-circle text-white"><Trash2 size={10} /></div>
                                    <span className="text-rose fw-extrabold uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>Rejection</span>
                                  </div>
                                  <div className="row g-2">
                                    <div className="col-6"><ModernSmallField label="Lines" value={edit.rejectionLines} isEdit={true} onChange={(v) => se(sl.id, "rejectionLines", v)} accent="rose" /></div>
                                    <div className="col-6"><ModernSmallField label="Inch" value={edit.rejectionLengthInch} isEdit={true} onChange={(v) => se(sl.id, "rejectionLengthInch", v)} accent="rose" /></div>
                                    <div className="col-6"><ModernSmallField label="MM" value={edit.rejectionLengthMm} isEdit={true} onChange={(v) => se(sl.id, "rejectionLengthMm", v)} accent="rose" /></div>
                                    <div className="col-6"><ModernSmallField label="CM" value={edit.rejectionLengthCm} isEdit={true} onChange={(v) => se(sl.id, "rejectionLengthCm", v)} accent="rose" /></div>
                                  </div>
                               </div>
                             </div>
                             {slErr && !slErr.startsWith("FIELD_SUBLOT:") && (
                               <div className="alert alert-danger mt-3 mb-0 p-2 small border-0 opacity-75">{slErr}</div>
                             )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── RIGHT (4 col): Metrics & Summary ── */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-premium rounded-5 bg-white mb-4 overflow-hidden sticky-top" style={{ top: '2rem' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-subtle rounded-4 text-indigo shadow-sm">
                      <Scale size={24} />
                    </div>
                    <h6 className="fw-extrabold m-0 text-navy uppercase tracking-wider">Metrics & Performance</h6>
                  </div>
                  
                  <div className="space-y-4">
                    <ModernStatRow label="Gross Weight" value={parseFloat(form.grossWeight || "0").toFixed(3)} unit={form.weightUnit} isEdit={isEditMode} field="grossWeight" onChange={f} />
                    <ModernStatRow label="Loss Factor" value={parseFloat(form.lessWeight || "0").toFixed(3)} unit={form.weightUnit} isEdit={isEditMode} field="lessWeight" onChange={f} />
                    
                    <div className="p-4 bg-primary-gradient rounded-4 text-white text-center shadow-primary-sm my-4">
                      <div className="small font-mono opacity-75 uppercase mb-1 fw-bold tracking-widest">Calculated Net Yield</div>
                      <div className="h3 fw-extrabold m-0">{(parseFloat(form.grossWeight || "0") - parseFloat(form.lessWeight || "0")).toFixed(3)} <span className="small fw-medium opacity-75">{form.weightUnit}</span></div>
                    </div>

                    <div className="bg-light p-4 rounded-4 mb-4 border border-light shadow-sm">
                       <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-secondary small fw-bold uppercase tracking-wider">Bunch Count</span>
                          {isEditMode ? (
                            <input type="number" className="form-control form-control-sm w-25 text-center fw-bold" value={form.bunch} onChange={(e) => f("bunch", e.target.value)} />
                          ) : (
                            <span className="badge bg-navy text-white px-3 py-2 rounded-pill fw-bold">{form.bunch} Sublots</span>
                          )}
                       </div>
                       <p className="small text-muted mb-0 opacity-75 fw-medium">Defines the total sublots to be distributed from this master entry.</p>
                    </div>

                    <hr className="border-secondary opacity-10" />
                    
                    <div className="row g-3">
                      <div className="col-12 col-xl-6">
                        <ModernBadgeStat label="Total Lines" value={form.noOfLines} isEdit={isEditMode} field="noOfLines" onChange={f} />
                      </div>
                      <div className="col-12 col-xl-6">
                        <ModernBadgeStat label="Spec Size" value={form.lineLengthInch} isEdit={isEditMode} field="lineLengthInch" onChange={f} />
                      </div>
                      <div className="col-6">
                        <ModernBadgeStat label="Length MM" value={form.lineLengthMm} isEdit={isEditMode} field="lineLengthMm" onChange={f} />
                      </div>
                      <div className="col-6">
                        <ModernBadgeStat label="Length CM" value={form.lineLengthCm} isEdit={isEditMode} field="lineLengthCm" onChange={f} />
                      </div>
                    </div>

                    {/* Quality Overview */}
                    <div className="mt-5">
                       <div className="d-flex align-items-center gap-2 mb-3">
                          <CheckCircle2 size={16} className="text-emerald" />
                          <span className="fw-extrabold text-navy uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Master QC Status</span>
                       </div>
                       <div className="row g-2">
                          <div className="col-6">
                             <div className="bg-emerald-subtle-25 p-3 rounded-4 border border-emerald border-opacity-10">
                                <div className="text-emerald small fw-bold uppercase mb-1" style={{ fontSize: '0.5rem' }}>Select. Lines</div>
                                {isEditMode ? (
                                  <input className="form-control form-control-sm border-0 bg-transparent p-0 fw-extrabold text-emerald" value={form.selectionLines} onChange={(e) => f("selectionLines", e.target.value)} />
                                ) : (
                                  <div className="h4 fw-extrabold text-emerald m-0">{form.selectionLines || "0"}</div>
                                )}
                             </div>
                          </div>
                          <div className="col-6">
                             <div className="bg-rose-subtle-25 p-3 rounded-4 border border-rose border-opacity-10">
                                <div className="text-rose small fw-bold uppercase mb-1" style={{ fontSize: '0.5rem' }}>Rej. Lines</div>
                                {isEditMode ? (
                                  <input className="form-control form-control-sm border-0 bg-transparent p-0 fw-extrabold text-rose" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)} />
                                ) : (
                                  <div className="h4 fw-extrabold text-rose m-0">{form.rejectionLines || "0"}</div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
        .bg-primary-subtle { background-color: rgba(79, 70, 229, 0.1) !important; }
        .text-navy { color: #0f172a !important; }
        .text-indigo { color: #4f46e5 !important; }
        .bg-indigo-subtle { background-color: rgba(79, 70, 229, 0.1) !important; }
        .text-emerald { color: #10b981 !important; }
        .bg-emerald { background-color: #10b981 !important; }
        .bg-emerald-subtle-25 { background-color: rgba(16, 185, 129, 0.04) !important; }
        .text-rose { color: #f43f5e !important; }
        .bg-rose { background-color: #f43f5e !important; }
        .bg-rose-subtle-25 { background-color: rgba(244, 63, 94, 0.04) !important; }
        .bg-navy { background-color: #0f172a !important; }
        .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -5px rgba(0, 0, 0, 0.02) !important; }
        .shadow-primary-sm { box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3) !important; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .letter-tight { letter-spacing: -0.025em; }
        .form-control-minimal { background: transparent; border: none; padding: 0.5rem 0; color: #1e293b; width: 100%; transition: all 0.2s; }
        .form-control-minimal:focus { outline: none; }
        .form-control-edit { background: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 0.75rem 1rem !important; border-radius: 12px !important; }
        .form-control-edit:focus { background: white !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; }
        .hover-scale:hover { transform: scale(1.05); }
        .rounded-5 { border-radius: 2rem !important; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .shadow-indigo-sm { box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3) !important; }
        .fw-extrabold { font-weight: 800; }
        .tracking-widest { letter-spacing: 0.1em !important; }
        .tracking-wider { letter-spacing: 0.05em !important; }
        .space-y-4 > * + * { margin-top: 1rem; }
      `}</style>
    </div>
  );
}

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="mb-2">
      <label className="text-secondary small d-flex align-items-center gap-2 mb-2 fw-bold tracking-wider uppercase opacity-80" style={{ fontSize: '0.65rem' }}>
        <span className="text-primary">{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

function ModernStatRow({ label, value, unit, isEdit, field, onChange }: { label: string; value: string; unit: string; isEdit: boolean; field: string; onChange: any }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2">
      <span className="text-secondary fw-semibold small">{label}</span>
      {isEdit ? (
        <div className="input-group input-group-sm w-50">
          <input 
            type="number" 
            className="form-control bg-light border-secondary-subtle px-3 fw-bold" 
            value={value} 
            onChange={(e) => onChange(field, e.target.value)} 
          />
          <span className="input-group-text bg-white border-secondary-subtle font-mono small">{unit}</span>
        </div>
      ) : (
        <span className="text-navy fw-extrabold fs-5">{value} <span className="small fw-medium text-muted opacity-50">{unit}</span></span>
      )}
    </div>
  );
}

function ModernBadgeStat({ label, value, isEdit, field, onChange }: { label: string; value: string; isEdit: boolean; field: string; onChange: any }) {
  return (
    <div className="bg-light p-3 rounded-4 transition-all hover-translate-y h-100 shadow-sm border border-light">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2" style={{ fontSize: '0.55rem' }}>{label}</div>
      {isEdit ? (
        <input 
          className="form-control form-control-sm bg-white border-0 border-bottom border-primary-subtle text-navy p-0 rounded-0 fw-bold"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      ) : (
        <div className="text-navy fw-extrabold">{value || "—"}</div>
      )}
    </div>
  );
}

function ModernSmallField({ label, value, unit, isEdit, onChange, accent }: { label: string; value: string; unit?: string; isEdit: boolean; onChange: (v: string) => void; accent: 'emerald' | 'rose' }) {
  const textColorClass = accent === 'emerald' ? 'text-emerald' : 'text-rose';
  const bgColorClass = accent === 'emerald' ? 'bg-emerald' : 'bg-rose';

  return (
    <div className="bg-white p-3 rounded-4 shadow-sm h-100 border border-white">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2 font-mono" style={{ fontSize: '0.5rem' }}>{label}</div>
      {isEdit ? (
        <div className="input-group input-group-sm border-bottom border-secondary-subtle">
          <input 
            type="number" 
            className="form-control border-0 bg-transparent text-navy p-0 fw-bold" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
          />
          {unit && <span className="input-group-text border-0 bg-transparent text-muted small px-1">{unit}</span>}
        </div>
      ) : (
        <div className={`fw-extrabold fs-6 ${textColorClass}`}>{value || "0"}<span className="small opacity-50 fw-medium ms-1">{unit}</span></div>
      )}
    </div>
  );
}
