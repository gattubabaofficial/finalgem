"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Edit, Save, Trash2,
  Loader2, AlertCircle, CheckCircle2,
  Calendar, User, Scale, Layers, Gem,
  AlertTriangle, Package, DollarSign, ChevronRight
} from "lucide-react";
import { formatINR, formatDate, getStatusLabel, getStatusColor, getCategoryLabel } from "@/lib/utils";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";

interface Params { id: string; }

export default function FinishedGoodDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useRole();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState<any>(null);

  const [form, setForm] = useState({
    supplierName: "", date: "", itemName: "", category: "SEMI_FINISHED",
    grossWeight: "", lessWeight: "", weightUnit: "G",
    pieces: "", shape: "", size: "", lines: "", lineLength: "",
    selectionWeight: "", selectionPieces: "", selectionLines: "", selectionLength: "",
    rejectionWeight: "", rejectionPieces: "", rejectionLines: "", rejectionLength: "",
    rejectionDate: "", rejectionStatus: "PENDING",
    purchasePrice: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/purchase/${id}`);
      if (!r.ok) throw new Error("Record not found");
      const d = await r.json();
      setData(d);
      const netWt = (d.grossWeight || 0) - (d.lessWeight || 0);
      setForm({
        supplierName: d.supplierName || "",
        date: d.date ? d.date.slice(0, 10) : "",
        itemName: d.itemName || "",
        category: d.category || "SEMI_FINISHED",
        grossWeight: d.grossWeight?.toString() || "",
        lessWeight: d.lessWeight?.toString() || "0",
        weightUnit: d.weightUnit || "G",
        pieces: d.pieces?.toString() || "",
        shape: d.shape || "",
        size: d.size || "",
        lines: d.lines?.toString() || "",
        lineLength: d.lineLength?.toString() || "",
        selectionWeight: d.selectionWeight?.toString() || netWt.toFixed(3),
        selectionPieces: d.selectionPieces?.toString() || "",
        selectionLines: d.selectionLines?.toString() || "",
        selectionLength: d.selectionLength?.toString() || "",
        rejectionWeight: d.rejectionWeight?.toString() || "",
        rejectionPieces: d.rejectionPieces?.toString() || "",
        rejectionLines: d.rejectionLines?.toString() || "",
        rejectionLength: d.rejectionLength?.toString() || "",
        rejectionDate: d.rejectionDate ? d.rejectionDate.slice(0, 10) : "",
        rejectionStatus: d.rejectionStatus || "PENDING",
        purchasePrice: d.purchasePrice?.toString() || "",
      });
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const r = await fetch(`/api/purchase/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          grossWeight: parseFloat(form.grossWeight),
          lessWeight: parseFloat(form.lessWeight || "0"),
          pieces: form.pieces ? parseInt(form.pieces) : undefined,
          lines: form.lines ? parseInt(form.lines) : undefined,
          lineLength: form.lineLength ? parseFloat(form.lineLength) : undefined,
          purchasePrice: parseFloat(form.purchasePrice || "0"),
          selectionWeight: form.selectionWeight ? parseFloat(form.selectionWeight) : undefined,
          selectionPieces: form.selectionPieces ? parseInt(form.selectionPieces) : undefined,
          selectionLines: form.selectionLines ? parseInt(form.selectionLines) : undefined,
          selectionLength: form.selectionLength ? parseFloat(form.selectionLength) : undefined,
          rejectionWeight: form.rejectionWeight ? parseFloat(form.rejectionWeight) : undefined,
          rejectionPieces: form.rejectionPieces ? parseInt(form.rejectionPieces) : undefined,
          rejectionLines: form.rejectionLines ? parseInt(form.rejectionLines) : undefined,
          rejectionLength: form.rejectionLength ? parseFloat(form.rejectionLength) : undefined,
          rejectionDate: form.rejectionDate || null,
        }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || "Failed to update"); }
      setSuccess("Record updated successfully!");
      setIsEditMode(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/purchase/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      router.push("/finished-goods");
    } catch (e: any) {
      setError(e.message);
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const netWeight = parseFloat(form.grossWeight || "0") - parseFloat(form.lessWeight || "0");

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5">
      {/* Premium Breadcrumb/Header */}
      <div className="bg-primary-gradient shadow-lg rounded-5 mx-4 mt-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-3 pb-3 border border-white border-opacity-10">
        <div className="d-flex align-items-center gap-4">
          <Link href="/finished-goods" className="gem-back-button" aria-label="Go back">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill font-mono shadow-sm border border-white border-opacity-20" style={{ fontSize: '0.75rem' }}>
                {data?.lot?.lotNumber || "N/A"}
              </span>
              <ChevronRight className="text-white text-opacity-50" size={16} />
              <span className="text-white text-opacity-80 small fw-bold tracking-wide">Finished Good Detail</span>
            </div>
            <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-md">
              {form.itemName || "Finished Good"}
            </h3>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3 pe-md-2">
          {!isEditMode ? (
            <>
              {isAdmin && <button 
                onClick={() => setIsEditMode(true)}
                className="btn bg-white text-primary d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-sm fw-extrabold border-0 transition-all hover-scale"
              >
                <Edit size={18} /> Edit Entry
              </button>}
              {isAdmin && <button 
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger text-white d-flex align-items-center gap-2 px-4 py-3 rounded-4 shadow-sm border-0 transition-all"
              >
                {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />} 
                <span className="fw-bold">Remove</span>
              </button>}
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditMode(false)}
                className="btn btn-link text-white text-opacity-80 text-decoration-none px-4 fw-bold hover-text-white"
              >
                Discard Changes
              </button>
              <button 
                type="submit" 
                form="editForm"
                disabled={saving}
                className="btn bg-white text-indigo d-flex align-items-center gap-2 px-5 py-3 rounded-4 shadow-sm border-0 transition-all"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                <span className="fw-bold">Apply Updates</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger p-3 d-flex align-items-center mb-4 border-0 shadow-sm">
          <AlertCircle className="w-5 h-5 me-2 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success p-3 d-flex align-items-center mb-4 border-0 shadow-sm">
          <CheckCircle2 className="w-5 h-5 me-2 flex-shrink-0" /> {success}
        </div>
      )}

      <form id="editForm" onSubmit={handleSave}>
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-12 col-xl-8">

            {/* Basic Info */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
                <Package className="w-5 h-5 text-primary me-2" />
                <h5 className="card-title fw-bold mb-0">Basic Information</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <Field label="Lot No" className="col-md-4">
                    <div className="p-2 bg-light rounded font-monospace fw-bold text-primary">{data?.lot?.lotNumber || "—"}</div>
                  </Field>
                  <Field label="Date" className="col-md-4">
                    {isEditMode
                      ? <input type="date" value={form.date} onChange={e => f("date", e.target.value)} className="form-control" />
                      : <div className="p-2 bg-light rounded d-flex align-items-center"><Calendar className="w-4 h-4 me-2 text-muted" />{formatDate(form.date)}</div>}
                  </Field>
                  <Field label="Supplier" className="col-md-4">
                    {isEditMode
                      ? <input value={form.supplierName} onChange={e => f("supplierName", e.target.value)} className="form-control" />
                      : <div className="p-2 bg-light rounded d-flex align-items-center"><User className="w-4 h-4 me-2 text-muted" />{form.supplierName || "—"}</div>}
                  </Field>
                  <Field label="Item Name" className="col-md-6">
                    {isEditMode
                      ? <input value={form.itemName} onChange={e => f("itemName", e.target.value)} className="form-control" />
                      : <div className="p-2 bg-light rounded">{form.itemName || "—"}</div>}
                  </Field>
                  <Field label="Category" className="col-md-3">
                    {isEditMode
                      ? <select value={form.category} onChange={e => f("category", e.target.value)} className="form-select">
                          {["ROUGH","SEMI_FINISHED","FINISHED","READY_GOODS","BY_ORDER"].map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                        </select>
                      : <div className="p-2 bg-light rounded">{getCategoryLabel(form.category)}</div>}
                  </Field>
                  <Field label="Purchase Price (₹)" className="col-md-3">
                    {isEditMode
                      ? <div className="input-group"><span className="input-group-text">₹</span><input type="number" step="0.01" value={form.purchasePrice} onChange={e => f("purchasePrice", e.target.value)} className="form-control" /></div>
                      : <div className="p-2 bg-light rounded fw-bold text-warning">{form.purchasePrice ? formatINR(parseFloat(form.purchasePrice)) : "—"}</div>}
                  </Field>
                </div>
              </div>
            </div>

            {/* Weight Details */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
                <Scale className="w-5 h-5 text-primary me-2" />
                <h5 className="card-title fw-bold mb-0">Weight Details</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <Field label="Weight Unit" className="col-md-3">
                    {isEditMode
                      ? <select value={form.weightUnit} onChange={e => f("weightUnit", e.target.value)} className="form-select">
                          {["G","KG","CT"].map(u => <option key={u}>{u}</option>)}
                        </select>
                      : <div className="p-2 bg-light rounded">{form.weightUnit}</div>}
                  </Field>
                  <Field label="Gross Weight" className="col-md-3">
                    {isEditMode ? <input type="number" step="0.001" value={form.grossWeight} onChange={e => f("grossWeight", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded fw-bold">{form.grossWeight} {form.weightUnit}</div>}
                  </Field>
                  <Field label="Less Weight" className="col-md-3">
                    {isEditMode ? <input type="number" step="0.001" value={form.lessWeight} onChange={e => f("lessWeight", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.lessWeight} {form.weightUnit}</div>}
                  </Field>
                  <Field label="Net Weight" className="col-md-3">
                    <div className="p-2 bg-primary bg-opacity-10 rounded fw-bold text-primary">{netWeight.toFixed(3)} {form.weightUnit}</div>
                  </Field>

                  <div className="col-12"><hr className="text-secondary opacity-25 my-1" /></div>
                  <p className="small fw-bold text-success text-uppercase mb-0 px-3">Selection</p>
                  <Field label="Selection Weight" className="col-md-3">
                    {isEditMode ? <input type="number" step="0.001" value={form.selectionWeight} onChange={e => f("selectionWeight", e.target.value)} className="form-control" /> : <div className="p-2 bg-success bg-opacity-10 text-success rounded fw-bold">{form.selectionWeight || "—"} {form.weightUnit}</div>}
                  </Field>
                  <Field label="Selection Pieces" className="col-md-3">
                    {isEditMode ? <input type="number" value={form.selectionPieces} onChange={e => f("selectionPieces", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.selectionPieces || "—"}</div>}
                  </Field>
                  <Field label="Selection Lines" className="col-md-3">
                    {isEditMode ? <input type="number" value={form.selectionLines} onChange={e => f("selectionLines", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.selectionLines || "—"}</div>}
                  </Field>
                  <Field label="Selection Length" className="col-md-3">
                    {isEditMode ? <input type="number" step="0.01" value={form.selectionLength} onChange={e => f("selectionLength", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.selectionLength || "—"}</div>}
                  </Field>
                </div>
              </div>
            </div>

            {/* Physical Specs */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
                <Layers className="w-5 h-5 text-primary me-2" />
                <h5 className="card-title fw-bold mb-0">Physical Specs</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <Field label="Pieces" className="col-md-3">
                    {isEditMode ? <input type="number" value={form.pieces} onChange={e => f("pieces", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.pieces || "—"}</div>}
                  </Field>
                  <Field label="Shape" className="col-md-3">
                    {isEditMode ? <input value={form.shape} onChange={e => f("shape", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.shape || "—"}</div>}
                  </Field>
                  <Field label="Size" className="col-md-3">
                    {isEditMode ? <input value={form.size} onChange={e => f("size", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.size || "—"}</div>}
                  </Field>
                  <Field label="Lines" className="col-md-3">
                    {isEditMode ? <input type="number" value={form.lines} onChange={e => f("lines", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.lines || "—"}</div>}
                  </Field>
                  <Field label="Line Length" className="col-md-3">
                    {isEditMode ? <input type="number" step="0.01" value={form.lineLength} onChange={e => f("lineLength", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.lineLength || "—"}</div>}
                  </Field>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Status + Rejection */}
          <div className="col-12 col-xl-4">
            {/* Status Card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-4 text-center">
                <Gem className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="mb-3">
                  <span className="text-muted small">Lot Status</span>
                  <div className="mt-1">
                    <span className={`badge px-3 py-2 fs-6 bg-${getStatusColor(data?.lot?.status || "IN_STOCK")} text-white`}>
                      {getStatusLabel(data?.lot?.status || "IN_STOCK")}
                    </span>
                  </div>
                </div>
                {data?.lot?.lotNumber && (
                  <div className="p-2 bg-light rounded mt-2">
                    <span className="small text-muted">Lot No</span>
                    <div className="font-monospace fw-bold text-primary">{data.lot.lotNumber}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Card */}
            <div className="card shadow-sm border-0 border-danger border-opacity-25">
              <div className="card-header bg-danger bg-opacity-10 border-bottom border-danger border-opacity-25 py-3 d-flex align-items-center">
                <AlertTriangle className="w-5 h-5 text-danger me-2" />
                <h5 className="card-title fw-bold mb-0 text-danger">Rejection Info</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <Field label="Rejection Weight" className="col-12">
                    {isEditMode
                      ? <div className="input-group"><input type="number" step="0.001" value={form.rejectionWeight} onChange={e => f("rejectionWeight", e.target.value)} className="form-control" /><span className="input-group-text">{form.weightUnit}</span></div>
                      : <div className="p-2 bg-light rounded text-danger fw-bold">{form.rejectionWeight || "0"} {form.weightUnit}</div>}
                  </Field>
                  <Field label="Rejection Pieces" className="col-6">
                    {isEditMode ? <input type="number" value={form.rejectionPieces} onChange={e => f("rejectionPieces", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.rejectionPieces || "—"}</div>}
                  </Field>
                  <Field label="Rejection Lines" className="col-6">
                    {isEditMode ? <input type="number" value={form.rejectionLines} onChange={e => f("rejectionLines", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.rejectionLines || "—"}</div>}
                  </Field>
                  <Field label="Rejection Length" className="col-6">
                    {isEditMode ? <input type="number" step="0.01" value={form.rejectionLength} onChange={e => f("rejectionLength", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.rejectionLength || "—"}</div>}
                  </Field>
                  <Field label="Return Date" className="col-6">
                    {isEditMode ? <input type="date" value={form.rejectionDate} onChange={e => f("rejectionDate", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.rejectionDate ? formatDate(form.rejectionDate) : "—"}</div>}
                  </Field>
                  <Field label="Rejection Status" className="col-12">
                    {isEditMode
                      ? <select value={form.rejectionStatus} onChange={e => f("rejectionStatus", e.target.value)} className="form-select">
                          {["PENDING","RETURNED","RESELLABLE","CLOSED"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      : <span className={`badge px-3 py-2 d-inline-block mt-1 bg-${
                            form.rejectionStatus === 'RETURNED' ? 'info' :
                            form.rejectionStatus === 'RESELLABLE' ? 'success' :
                            form.rejectionStatus === 'CLOSED' ? 'secondary' : 'warning'
                          } text-white`}>
                          {form.rejectionStatus}
                        </span>}
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        {isEditMode && (
          <div className="d-flex justify-content-end mt-4">
            <button type="submit" disabled={saving} className="btn btn-primary shadow-sm px-4 d-flex align-items-center gap-2 fw-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
      <style jsx>{`
        .bg-light { background-color: #f8fafc !important; }
        .text-navy { color: #0f172a !important; }
        .bg-navy { background-color: #0f172a !important; }
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
        .btn-indigo { background-color: #4f46e5; color: white; }
        .btn-indigo:hover { background-color: #4338ca; color: white; transform: translateY(-2px); }
        .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -5px rgba(0, 0, 0, 0.02) !important; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .letter-tight { letter-spacing: -0.025em; }
        .hover-translate-y:hover { transform: translateY(-3px); }
        .hover-scale:hover { transform: scale(1.05); }
        .rounded-5 { border-radius: 2rem !important; }
        .rounded-4 { border-radius: 1rem !important; }
        .fw-extrabold { font-weight: 800; }
        .drop-shadow-md { filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06)); }
      `}</style>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="form-label mb-2 text-muted fw-semibold small">{label}</label>
      {children}
    </div>
  );
}
