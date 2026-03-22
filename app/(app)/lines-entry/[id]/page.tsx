"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import {
  ArrowLeft, Edit, Save, Trash2, Loader2, AlertCircle, CheckCircle2,
  ChevronRight, AlignJustify, Package, Info, User, Calendar,
  Layers, Hash, ExternalLink
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

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
    <div className="container-fluid p-0 pb-5" suppressHydrationWarning={true}>
      {/* ── Page header ── */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-2">
        <div className="d-flex align-items-center gap-3">
          <Link href="/purchase" className="btn bg-white bg-opacity-10 shadow-sm rounded-4 p-3 border border-white border-opacity-25">
            <ArrowLeft className="text-white" size={22} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-3 py-2 rounded-pill font-monospace">
                {form.lotNo}
              </span>
              <ChevronRight className="text-white text-opacity-50" size={15} />
              <span className="text-white text-opacity-75 small">Lines Entry</span>
            </div>
            <h3 className="fw-bold text-white m-0">{form.itemName || "Lines Entry"}</h3>
          </div>
        </div>
        <div className="d-flex gap-2">
          {!isEditMode ? (
            <>
              {isAdmin && (
                <button onClick={() => setIsEditMode(true)}
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-4 fw-bold">
                  <Edit size={16} /> Edit Info
                </button>
              )}
              {isAdmin && (
                <button onClick={handleDelete} disabled={deleting}
                  className="btn btn-white text-danger d-flex align-items-center gap-2 px-4 py-2 rounded-4">
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Remove
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => setIsEditMode(false)} className="btn btn-link text-white text-decoration-none">Cancel</button>
              <button type="submit" form="detailForm" disabled={masterSaving}
                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-4 fw-bold">
                {masterSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Info
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 p-3 d-flex align-items-center gap-2 mb-3 mx-4">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="small">{error}</span>
          <button className="btn-close ms-auto" onClick={() => setError("")} />
        </div>
      )}
      {success && (
        <div className="alert alert-success border-0 shadow-sm rounded-4 p-3 d-flex align-items-center gap-2 mb-3 mx-4">
          <CheckCircle2 size={18} className="flex-shrink-0" /> <span className="small">{success}</span>
        </div>
      )}

      <div className="px-4">
        <form id="detailForm" onSubmit={handleUpdate}>
          <div className="row g-4">
            {/* ── LEFT: Master info card ── */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 bg-white">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary"><Info size={17} /></div>
                    <h5 className="fw-bold m-0">Entry Info</h5>
                  </div>
                  <div className="row g-3">
                    {[
                      { label: "Lot No", key: "lotNo", icon: <Hash size={13} /> },
                      { label: "Date", key: "date", icon: <Calendar size={13} />, type: "date" },
                      { label: "Item Name", key: "itemName", icon: <AlignJustify size={13} /> },
                      { label: "Supplier", key: "supplier", icon: <User size={13} /> },
                    ].map(({ label, key, icon, type }) => (
                      <div key={key} className="col-12">
                        <label className="d-flex align-items-center gap-1 text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: "0.6rem" }}>
                          <span className="text-primary">{icon}</span> {label}
                        </label>
                        {isEditMode ? (
                          <>
                            <input type={type || "text"} value={(form as any)[key]} onChange={(e) => f(key, e.target.value)} 
                              onBlur={() => key === "lotNo" && checkLotExists((form as any)[key] as string)}
                              className={`form-control form-control-sm ${key === "lotNo" && error?.startsWith("FIELD_LOTNO:") ? "is-invalid" : ""}`} />
                            {key === "lotNo" && error?.startsWith("FIELD_LOTNO:") && (
                              <div className="text-danger small mt-1">{error.replace("FIELD_LOTNO:", "")}</div>
                            )}
                          </>
                        ) : (
                          <div className="fw-semibold text-dark">{key === "date" ? formatDate((form as any)[key]) : ((form as any)[key] || "—")}</div>
                        )}
                      </div>
                    ))}

                    <div className="col-12">
                      <label className="d-flex align-items-center gap-1 text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: "0.6rem" }}>
                        <span className="text-primary"><Layers size={13} /></span> Bunch
                      </label>
                      {isEditMode ? (
                        <input type="number" min="0" value={form.bunch} onChange={(e) => f("bunch", e.target.value)} className="form-control form-control-sm" />
                      ) : (
                        <span className={`badge px-3 py-2 ${bunch > 0 ? "bg-success" : "bg-secondary"}`}>
                          {bunch > 0 ? `${bunch} sublot${bunch > 1 ? "s" : ""}` : "No sublots"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lines details */}
                  <hr className="my-3" />
                  <p className="small fw-bold text-muted text-uppercase mb-2" style={{ fontSize: "0.65rem" }}>Lines Details (Master)</p>
                  <div className="row g-2">
                    {[
                      { label: "No. of Lines", key: "noOfLines", step: "1" },
                      { label: "Length inch", key: "lineLengthInch", step: "0.001" },
                      { label: "Length mm", key: "lineLengthMm", step: "0.001" },
                      { label: "Length cm", key: "lineLengthCm", step: "0.001" },
                    ].map(({ label, key, step }) => (
                      <div key={key} className="col-6">
                        <div className="bg-light rounded-3 p-2">
                          <div className="text-muted" style={{ fontSize: "0.55rem" }}>{label}</div>
                          {isEditMode ? (
                            <input type="number" step={step} value={(form as any)[key]} onChange={(e) => f(key, e.target.value)}
                              className="form-control form-control-sm border-0 bg-transparent p-0 fw-bold" />
                          ) : (
                            <div className="fw-bold text-dark small">{(form as any)[key] || "—"}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Master selection / rejection summary */}
                  <div className="row g-2 mt-2">
                    <div className="col-6">
                      <div className="rounded-3 p-2" style={{ background: "rgba(16,185,129,0.07)" }}>
                        <div className="text-success fw-bold text-uppercase mb-1" style={{ fontSize: "0.55rem" }}>Selection Lines</div>
                        {isEditMode ? (
                          <input type="number" value={form.selectionLines} onChange={(e) => f("selectionLines", e.target.value)}
                            className="form-control form-control-sm border-0 bg-transparent p-0 fw-bold text-success" />
                        ) : (
                          <div className="fw-bold text-success small">{form.selectionLines || "—"}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="rounded-3 p-2" style={{ background: "rgba(244,63,94,0.07)" }}>
                        <div className="text-danger fw-bold text-uppercase mb-1" style={{ fontSize: "0.55rem" }}>Rejection Lines</div>
                        {isEditMode ? (
                          <input type="number" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)}
                            className="form-control form-control-sm border-0 bg-transparent p-0 fw-bold text-danger" />
                        ) : (
                          <div className="fw-bold text-danger small">{form.rejectionLines || "—"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Sublot cards — always editable ── */}
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-3">
                <AlignJustify size={18} className="text-white" />
                <h5 className="fw-bold text-white m-0">Sublots ({sublots.length})</h5>
                {sublots.length === 0 && (
                  <span className="text-white text-opacity-50 small ms-2">— Set Bunch ≥ 1 and save to create sublots</span>
                )}
              </div>

              {sublots.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 bg-white">
                  <div className="card-body p-5 text-center text-muted">
                    <AlignJustify size={36} className="mb-3 opacity-25" />
                    <p className="mb-0 small">No sublots yet. Edit Entry Info, set Bunch ≥ 1, and save.</p>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {sublots.map((sl) => {
                    const edit = sublotEdits[sl.id] ?? blankEdit;
                    const saving = sublotSaving[sl.id] ?? false;
                    const saved = sublotSaved[sl.id] ?? false;
                    const slErr = sublotError[sl.id] ?? "";
                    const sending = fgSending[sl.id] ?? false;

                    return (
                      <div key={sl.id} className="col-12 col-xl-6">
                        <div className={`card h-100 border-0 shadow-sm rounded-4 ${sl.sentToFinishedGoods ? "border border-success" : "bg-white"}`}>
                          <div className="card-body p-3">
                            {/* Sublot header with manual sublot number input */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1 me-2">
                                <div className="d-flex align-items-center gap-1 flex-grow-1">
                                  <span className="text-muted fw-bold" style={{ fontSize: "0.65rem", whiteSpace: "nowrap" }}>SUB LOT #</span>
                                  <div className="flex-grow-1">
                                    <input
                                      type="text"
                                      value={edit.sublotNo}
                                      onChange={(e) => se(sl.id, "sublotNo", e.target.value)}
                                      onBlur={() => checkLotExists(edit.sublotNo, true, sl.id)}
                                      placeholder={`e.g. ${(sl.sublotIndex ?? 1).toString().padStart(2, "0")}`}
                                      className={`form-control form-control-sm fw-bold font-monospace ${slErr?.startsWith("FIELD_SUBLOT:") ? "is-invalid" : ""}`}
                                      style={{ width: "130px", fontSize: "0.85rem" }}
                                    />
                                    {slErr?.startsWith("FIELD_SUBLOT:") && (
                                      <div className="text-danger" style={{ fontSize: "0.6rem", marginTop: "2px" }}>
                                        {slErr.replace("FIELD_SUBLOT:", "")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {sl.sentToFinishedGoods && (
                                  <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: "0.65rem" }}>
                                    <Package size={10} /> Finished Goods
                                  </span>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                {saved && (
                                  <span className="text-success small d-flex align-items-center gap-1">
                                    <CheckCircle2 size={13} /> Saved
                                  </span>
                                )}
                                <button type="button" onClick={() => saveSublot(sl.id)} disabled={saving}
                                  className="btn btn-sm btn-primary d-flex align-items-center gap-1 px-3">
                                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                  {saving ? "Saving…" : "Save"}
                                </button>
                                {!sl.sentToFinishedGoods && (
                                  <button type="button" onClick={() => sendToFG(sl)} disabled={sending}
                                    className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 px-2"
                                    title="Mark selection as sent to Finished Goods">
                                    {sending ? <Loader2 size={11} className="animate-spin" /> : <Package size={11} />}
                                    → FG
                                  </button>
                                )}
                                {sl.sentToFinishedGoods && (
                                  <Link href="/finished-goods" className="btn btn-sm btn-success d-flex align-items-center gap-1 px-2">
                                    <ExternalLink size={11} /> FG
                                  </Link>
                                )}
                              </div>
                            </div>

                            {slErr && (
                              <div className="text-danger small mb-2 d-flex align-items-center gap-1">
                                <AlertCircle size={12} /> {slErr}
                              </div>
                            )}

                            {/* ── Selection & Rejection fields — ALWAYS visible ── */}
                            <div className="row g-2">
                              {/* SELECTION */}
                              <div className="col-6">
                                <div className="p-2 rounded-3 h-100" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
                                  <p className="fw-bold text-success mb-2" style={{ fontSize: "0.6rem" }}>✓ SELECTION</p>
                                  <div className="row g-1">
                                    {(
                                      [
                                        { label: "Lines", key: "selectionLines" as keyof SublotEdit, step: "1" },
                                        { label: "Inch", key: "selectionLengthInch" as keyof SublotEdit, step: "0.001" },
                                        { label: "MM", key: "selectionLengthMm" as keyof SublotEdit, step: "0.001" },
                                        { label: "CM", key: "selectionLengthCm" as keyof SublotEdit, step: "0.001" },
                                      ]
                                    ).map(({ label, key, step }) => (
                                      <div key={key} className="col-6">
                                        <label className="text-muted d-block" style={{ fontSize: "0.55rem" }}>{label}</label>
                                        <input
                                          type="number"
                                          step={step}
                                          value={edit[key]}
                                          onChange={(e) => se(sl.id, key, e.target.value)}
                                          className="form-control form-control-sm"
                                          style={{ fontSize: "0.8rem" }}
                                          placeholder="0"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* REJECTION */}
                              <div className="col-6">
                                <div className="p-2 rounded-3 h-100" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.2)" }}>
                                  <p className="fw-bold text-danger mb-2" style={{ fontSize: "0.6rem" }}>✗ REJECTION</p>
                                  <div className="row g-1">
                                    {(
                                      [
                                        { label: "Lines", key: "rejectionLines" as keyof SublotEdit, step: "1" },
                                        { label: "Inch", key: "rejectionLengthInch" as keyof SublotEdit, step: "0.001" },
                                        { label: "MM", key: "rejectionLengthMm" as keyof SublotEdit, step: "0.001" },
                                        { label: "CM", key: "rejectionLengthCm" as keyof SublotEdit, step: "0.001" },
                                      ]
                                    ).map(({ label, key, step }) => (
                                      <div key={key} className="col-6">
                                        <label className="text-muted d-block" style={{ fontSize: "0.55rem" }}>{label}</label>
                                        <input
                                          type="number"
                                          step={step}
                                          value={edit[key]}
                                          onChange={(e) => se(sl.id, key, e.target.value)}
                                          className="form-control form-control-sm"
                                          style={{ fontSize: "0.8rem" }}
                                          placeholder="0"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* End selection/rejection row */}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function MiniField({ label, children, icon, className = "" }: {
  label: string; children: React.ReactNode; icon?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`mb-1 ${className}`}>
      <label className="text-secondary d-flex align-items-center gap-1 mb-1 fw-bold text-uppercase" style={{ fontSize: "0.62rem" }}>
        {icon && <span className="text-primary">{icon}</span>} {label}
      </label>
      {children}
    </div>
  );
}
