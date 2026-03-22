"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, Save, Trash2, 
  Loader2, AlertCircle, CheckCircle2,
  Calendar, User,
  Scale, Layers, DollarSign, Activity
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";

const WEIGHT_UNITS = ["G", "KG", "CT"];

interface Params {
  id: string;
}

export default function ManufacturingDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useRole();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [form, setForm] = useState({
    subLotNo: "", date: "", issuedTo: "", processType: "",
    weight: "", weightUnit: "G", size: "", shape: "", lines: "", length: "", pieces: "",
    labourCost: "", otherCost: "", status: "IN_PROCESS", outputQuantity: ""
  });

  const fetchManufacturing = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/manufacturing/${id}`);
      if (!r.ok) throw new Error("Failed to fetch manufacturing record");
      const data = await r.json();
      
      setForm({
        subLotNo: data.lot?.lotNumber || "",
        date: data.date ? data.date.slice(0, 10) : "",
        issuedTo: data.issuedTo || "",
        processType: data.processType || "",
        weight: data.weight?.toString() || "",
        weightUnit: data.weightUnit || "G",
        pieces: data.pieces?.toString() || "",
        size: data.size || "",
        shape: data.shape || "",
        lines: data.lines?.toString() || "",
        length: data.length?.toString() || "",
        labourCost: data.labourCost?.toString() || "0",
        otherCost: data.otherCost?.toString() || "0",
        status: data.status || "IN_PROCESS",
        outputQuantity: data.outputQuantity?.toString() || ""
      });
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Manufacturing record not found or error loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchManufacturing(); }, [id]);

  const f = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const r = await fetch(`/api/manufacturing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          weight: parseFloat(form.weight || "0"),
          pieces: form.pieces ? parseInt(form.pieces) : undefined,
          lines: form.lines ? parseInt(form.lines) : undefined,
          length: form.length ? parseFloat(form.length) : undefined,
          labourCost: parseFloat(form.labourCost || "0"),
          otherCost: parseFloat(form.otherCost || "0"),
          outputQuantity: form.outputQuantity ? parseInt(form.outputQuantity) : undefined,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Failed to update record");
      }
      setSuccess("Manufacturing record updated successfully!");
      setIsEditMode(false);
      fetchManufacturing();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this manufacturing record? This will revert any stock ledgers and changes.")) return;
    setDeleting(true); setError("");
    try {
      const r = await fetch(`/api/manufacturing/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete record");
      router.push("/manufacturing");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const num = (v: string) => parseFloat(v || "0");
  const totalCostCalc = num(form.labourCost) + num(form.otherCost);

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link href="/manufacturing" className="btn btn-light btn-sm rounded-circle p-2 shadow-sm text-secondary hover-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="h3 mb-0 text-white fw-bold">Sub Lot <span className="text-primary font-monospace">{form.subLotNo || "N/A"}</span></h1>
            <p className="text-white text-opacity-50 text-sm mb-0">Manufacturing Details & Costings</p>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          {!isEditMode ? (
            <>
              {isAdmin && <button onClick={() => setIsEditMode(true)} className="btn btn-primary shadow-sm d-flex align-items-center gap-2 border-0 px-3 py-2 fw-semibold">
                <Edit className="w-4 h-4" /> Edit Record
              </button>}
              {isAdmin && <button onClick={handleDelete} disabled={deleting} className="btn btn-danger shadow-sm d-flex align-items-center gap-2 border-0 px-3 py-2 fw-semibold opacity-75 hover-opacity-100 transition-all">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>}
            </>
          ) : (
            <button onClick={() => { setIsEditMode(false); fetchManufacturing(); setError(""); }} className="btn btn-light shadow-sm">
              Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger p-3 d-flex align-items-center mb-4 shadow-sm border-0">
          <AlertCircle className="w-5 h-5 me-2 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success p-3 d-flex align-items-center mb-4 shadow-sm border-0">
          <CheckCircle2 className="w-5 h-5 me-2 flex-shrink-0" /> {success}
        </div>
      )}

      {/* Main Content */}
      <div className="row g-4">
        {/* Left Column - Core Details */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
              <Activity className="w-5 h-5 text-primary me-2" />
              <h5 className="card-title fw-bold mb-0">Manufacturing Information</h5>
            </div>
            <div className="card-body p-4">
              <form id="editForm" onSubmit={handleSave} className="row g-4">
                
                {/* Process Details */}
                <div className="col-12">
                  <h6 className="fw-bold text-muted text-uppercase mb-3 small d-flex align-items-center">
                    Process Details
                  </h6>
                  <div className="row g-3">
                    <Field label="Sub Lot No" className="col-md-6 text-primary font-monospace fw-bold">
                      {isEditMode ? 
                        <input required value={form.subLotNo} onChange={(e) => f("subLotNo", e.target.value)} className="form-control font-monospace border-primary" /> 
                        : <div className="p-2 bg-light rounded bg-opacity-50">{form.subLotNo || "—"}</div>}
                    </Field>
                    <Field label="Date" className="col-md-6">
                      {isEditMode ? 
                        <input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="form-control" />
                        : <div className="p-2 bg-light rounded d-flex align-items-center"><Calendar className="w-4 h-4 me-2 text-muted" />{formatDate(form.date)}</div>}
                    </Field>
                    <Field label="Issued To" className="col-md-6">
                      {isEditMode ? 
                        <input required value={form.issuedTo} onChange={(e) => f("issuedTo", e.target.value)} className="form-control" />
                        : <div className="p-2 bg-light rounded d-flex align-items-center"><User className="w-4 h-4 me-2 text-muted" />{form.issuedTo || "—"}</div>}
                    </Field>
                    <Field label="Process Type" className="col-md-6">
                      {isEditMode ? 
                        <input value={form.processType} onChange={(e) => f("processType", e.target.value)} className="form-control" placeholder="e.g. Cutting, Polishing" />
                        : <div className="p-2 bg-light rounded">{form.processType || "—"}</div>}
                    </Field>
                  </div>
                </div>

                <div className="col-12"><hr className="text-secondary opacity-25" /></div>

                {/* Specs Section */}
                <div className="col-12">
                  <h6 className="fw-bold text-muted text-uppercase mb-3 small d-flex align-items-center">
                    Issued Material Specs
                  </h6>
                  <div className="row g-3">
                    <Field label="Weight Unit" className="col-md-4">
                      {isEditMode ? 
                        <select value={form.weightUnit} onChange={(e) => f("weightUnit", e.target.value)} className="form-select">
                          {WEIGHT_UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                        : <div className="p-2 bg-light rounded">{form.weightUnit}</div>}
                    </Field>
                    <Field label="Weight" className="col-md-4">
                      {isEditMode ? 
                        <input type="number" step="0.001" value={form.weight} onChange={(e) => f("weight", e.target.value)} className="form-control" />
                        : <div className="p-2 bg-light rounded d-flex align-items-center text-primary fw-bold"><Scale className="w-4 h-4 me-2 text-muted" />{form.weight} {form.weightUnit}</div>}
                    </Field>
                    <Field label="Pieces" className="col-md-4">
                      {isEditMode ? 
                        <input type="number" value={form.pieces} onChange={(e) => f("pieces", e.target.value)} className="form-control" />
                        : <div className="p-2 bg-light rounded d-flex align-items-center"><Layers className="w-4 h-4 me-2 text-muted" />{form.pieces || "—"}</div>}
                    </Field>
                    
                    <Field label="Shape" className="col-md-3">
                      {isEditMode ? <input value={form.shape} onChange={(e) => f("shape", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.shape || "—"}</div>}
                    </Field>
                    <Field label="Size" className="col-md-3">
                      {isEditMode ? <input value={form.size} onChange={(e) => f("size", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.size || "—"}</div>}
                    </Field>
                    <Field label="Lines" className="col-md-3">
                      {isEditMode ? <input type="number" value={form.lines} onChange={(e) => f("lines", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.lines || "—"}</div>}
                    </Field>
                    <Field label="Length" className="col-md-3">
                      {isEditMode ? <input type="number" step="0.01" value={form.length} onChange={(e) => f("length", e.target.value)} className="form-control" /> : <div className="p-2 bg-light rounded">{form.length || "—"}</div>}
                    </Field>
                    <Field label="Output Quantity (Wait)" className="col-md-6 mt-3">
                      {isEditMode ? <input type="number" value={form.outputQuantity} onChange={(e) => f("outputQuantity", e.target.value)} className="form-control" placeholder="Finished Pieces" /> : <div className="p-2 bg-success bg-opacity-10 text-success fw-bold rounded">{form.outputQuantity || "—"}</div>}
                    </Field>
                  </div>
                </div>

              </form>
            </div>
            {isEditMode && (
              <div className="card-footer bg-light border-top p-4 d-flex justify-content-end">
                <button type="submit" form="editForm" disabled={saving} className="btn btn-primary shadow-sm px-4 d-flex align-items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Costings */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
              <DollarSign className="w-5 h-5 text-success me-2" />
              <h5 className="card-title fw-bold mb-0">Costings</h5>
            </div>
            <div className="card-body p-4 bg-light bg-opacity-50">
              <div className="space-y-4">
                <Field label="Labour Cost">
                  {isEditMode ? 
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">₹</span>
                      <input type="number" step="0.01" value={form.labourCost} onChange={(e) => f("labourCost", e.target.value)} className="form-control border-start-0 ps-0" />
                    </div>
                    : <div className="d-flex justify-content-end align-items-center p-3 bg-white border border-secondary border-opacity-10 rounded fw-semibold text-dark fs-5 shadow-sm">{formatINR(num(form.labourCost))}</div>}
                </Field>
                <Field label="Other Cost">
                  {isEditMode ? 
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">₹</span>
                      <input type="number" step="0.01" value={form.otherCost} onChange={(e) => f("otherCost", e.target.value)} className="form-control border-start-0 ps-0" />
                    </div>
                    : <div className="d-flex justify-content-end align-items-center p-3 bg-white border border-secondary border-opacity-10 rounded fw-semibold text-dark fs-5 shadow-sm">{formatINR(num(form.otherCost))}</div>}
                </Field>

                <hr className="my-4 text-secondary opacity-25" />

                <div className="p-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 d-flex flex-column align-items-end shadow-sm">
                  <span className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.05em' }}>Total Mfg Cost</span>
                  <span className="text-primary fw-bolder" style={{ fontSize: '1.75rem', lineHeight: '1' }}>
                    {formatINR(totalCostCalc)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="form-label mb-2 text-muted fw-semibold small" style={{ letterSpacing: '0.02em' }}>{label}</label>
      {children}
    </div>
  );
}
