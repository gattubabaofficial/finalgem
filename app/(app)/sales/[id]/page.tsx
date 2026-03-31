"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, Save, Trash2, 
  Loader2, AlertCircle, CheckCircle2,
  Calendar, User, ChevronRight,
  Scale, Layers, Package, Info, Hash, Tag,
  Layout, Ruler, Box, Activity, Receipt,
  DollarSign, ShoppingCart, TrendingUp
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";

interface Params {
  id: string;
}

const STATUS_OPTIONS = ["PENDING", "COMPLETED", "CANCELLED", "REJECTED"];

export default function SaleDetailPage({ params }: { params: Promise<Params> }) {
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
    lotNo: "", date: "", customer: "", billNo: "",
    weight: "", weightUnit: "G", pieces: "", size: "",
    shape: "", lines: "", lineLength: "", itemName: "",
    baseSale: "", otherSale: "", netSale: "", status: "COMPLETED"
  });

  const fetchSale = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/sales/${id}`);
      if (!r.ok) throw new Error("Failed to fetch sale");
      const d = await r.json();
      setData(d);
      
      setForm({
        lotNo: d.lotNo || "",
        date: d.date ? d.date.slice(0, 10) : "",
        customer: d.customer || "",
        billNo: d.billNo || "",
        weight: d.weight?.toString() || "",
        weightUnit: d.weightUnit || "G",
        pieces: d.pieces?.toString() || "",
        size: d.size || "",
        shape: d.shape || "",
        lines: d.lines?.toString() || "",
        lineLength: d.lineLength?.toString() || "",
        itemName: d.itemName || "",
        baseSale: d.baseSale?.toString() || "0",
        otherSale: d.otherSale?.toString() || "0",
        netSale: d.netSale?.toString() || "0",
        status: d.status || "COMPLETED"
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSale(); }, [id]);

  const f = (k: string, v: string) => setForm(p => {
    const next = { ...p, [k]: v };
    if (k === "baseSale" || k === "otherSale") {
      next.netSale = (parseFloat(next.baseSale || "0") + parseFloat(next.otherSale || "0")).toString();
    }
    return next;
  });

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const r = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          weight: parseFloat(form.weight),
          pieces: form.pieces ? parseInt(form.pieces) : undefined,
          lines: form.lines ? parseInt(form.lines) : undefined,
          lineLength: form.lineLength ? parseFloat(form.lineLength) : undefined,
          baseSale: parseFloat(form.baseSale),
          otherSale: parseFloat(form.otherSale),
          netSale: parseFloat(form.netSale),
        }),
      });
      if (!r.ok) throw new Error("Update failed");
      setSuccess("Sale updated successfully!");
      setIsEditMode(false);
      fetchSale();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure?")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      router.push("/sales");
    } catch (e: any) {
      setError(e.message);
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5">
      {/* Premium Breadcrumb/Header */}
      <div className="bg-primary-gradient shadow-lg rounded-5 mx-4 mt-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-3 pb-3 border border-white border-opacity-10">
        <div className="d-flex align-items-center gap-4">
          <Link href="/sales" className="gem-back-button" aria-label="Go back">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill font-mono shadow-sm border border-white border-opacity-20" style={{ fontSize: '0.75rem' }}>
                Lot #{form.lotNo}
              </span>
              <ChevronRight className="text-white text-opacity-50" size={16} />
              <span className="text-white text-opacity-80 small fw-bold tracking-wide">Sale Detail</span>
            </div>
            <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-sm">
              {form.customer || "Sale Transaction"}
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
                <Edit size={18} /> Edit Sale
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

      <form id="editForm" onSubmit={handleUpdate} className="px-4">
        <div className="row g-4 font-inter">
          <div className="col-lg-8">
            <div className="card border-0 shadow-premium rounded-5 overflow-hidden mb-4 bg-white">
              <div className="card-body p-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="p-3 bg-primary-subtle rounded-4 text-primary shadow-sm">
                    <Receipt size={24} />
                  </div>
                  <h4 className="fw-extrabold m-0 text-navy uppercase tracking-widest">Transaction Metadata</h4>
                </div>

                <div className="row g-5">
                  <div className="col-md-6">
                    <Field label="Customer Name" icon={<User size={18} />}>
                      <input 
                        readOnly={!isEditMode}
                        value={form.customer} 
                        onChange={(e) => f("customer", e.target.value)} 
                        className={`form-control-minimal fw-bold fs-5 ${isEditMode ? 'form-control-edit' : ''}`} 
                      />
                    </Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Bill / Invoice Number" icon={<Hash size={18} />}>
                      <input 
                        readOnly={!isEditMode}
                        value={form.billNo} 
                        onChange={(e) => f("billNo", e.target.value)} 
                        className={`form-control-minimal fw-bold fs-5 ${isEditMode ? 'form-control-edit' : ''}`} 
                      />
                    </Field>
                  </div>
                  <div className="col-md-6">
                    <Field label="Sale Date" icon={<Calendar size={18} />}>
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
                    <Field label="Item Dispatched" icon={<Tag size={18} />}>
                      <input 
                        readOnly={!isEditMode}
                        value={form.itemName} 
                        onChange={(e) => f("itemName", e.target.value)} 
                        className={`form-control-minimal text-indigo fw-bold ${isEditMode ? 'form-control-edit' : ''}`} 
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            <div className="card h-100 border-0 shadow-premium rounded-5 bg-emerald-subtle-25">
              <div className="card-body p-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                   <div className="p-3 bg-emerald rounded-4 text-white shadow-sm">
                    <Package size={24} />
                  </div>
                  <h4 className="fw-extrabold m-0 text-emerald uppercase tracking-widest">Product Geometry</h4>
                </div>
                <div className="row g-4">
                  <div className="col-md-4">
                    <ModernBadgeStat label="Product Weight" value={`${form.weight} ${form.weightUnit}`} isEdit={false} field="" onChange={() => {}} />
                  </div>
                  <div className="col-md-4">
                    <ModernSmallField label="Pieces Count" value={form.pieces} isEdit={isEditMode} onChange={(v) => f("pieces", v)} accent="emerald" />
                  </div>
                  <div className="col-md-4">
                    <ModernSmallField label="Total Strands" value={form.lines} isEdit={isEditMode} onChange={(v) => f("lines", v)} accent="emerald" />
                  </div>
                  <div className="col-md-4">
                    <ModernBadgeStat label="Geometry/Shape" value={form.shape} isEdit={isEditMode} field="shape" onChange={f} />
                  </div>
                  <div className="col-md-4">
                    <ModernBadgeStat label="Dimension Ref" value={form.size} isEdit={isEditMode} field="size" onChange={f} />
                  </div>
                  <div className="col-md-4">
                    <ModernBadgeStat label="Strand Length" value={form.lineLength} isEdit={isEditMode} field="lineLength" onChange={f} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
             <div className="card border-0 shadow-premium rounded-5 bg-navy text-white overflow-hidden mb-4 sticky-top" style={{ top: '2rem' }}>
              <div className="bg-primary-gradient p-5 text-center">
                <div className="small font-mono opacity-75 uppercase mb-2 tracking-widest">Net Sale Value</div>
                <div className="h1 fw-extrabold text-amber-500 m-0 letter-tight">{formatINR(parseFloat(form.netSale || "0"))}</div>
              </div>
              <div className="card-body p-5">
                <div className="space-y-4">
                  <ModernStatRow label="Acquisition/Base" value={parseFloat(form.baseSale || "0").toFixed(2)} unit="₹" isEdit={isEditMode} field="baseSale" onChange={f} />
                  <ModernStatRow label="Premiums/Other" value={parseFloat(form.otherSale || "0").toFixed(2)} unit="₹" isEdit={isEditMode} field="otherSale" onChange={f} />
                  
                  <hr className="border-white border-opacity-10" />
                  
                  <div className="p-4 bg-white bg-opacity-5 rounded-4 border border-white border-opacity-10 text-center mt-5">
                    <div className="small opacity-50 uppercase mb-2 fw-bold tracking-widest">Transaction Status</div>
                    {isEditMode ? (
                        <select 
                          className="form-select bg-transparent border-primary border-opacity-50 text-white fw-bold text-center"
                          value={form.status}
                          onChange={(e) => f("status", e.target.value)}
                        >
                          {STATUS_OPTIONS.map(o => <option key={o} className="text-dark" value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <div className={`h5 fw-extrabold m-0 text-${form.status === 'COMPLETED' ? 'emerald' : form.status === 'PENDING' ? 'warning' : 'rose'}`}>
                          {form.status}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .bg-light { background-color: #f8fafc !important; }
        .text-navy { color: #0f172a !important; }
        .text-emerald { color: #10b981 !important; }
        .bg-emerald { background-color: #10b981 !important; }
        .bg-emerald-subtle-25 { background-color: rgba(16, 185, 129, 0.04) !important; }
        .bg-navy { background-color: #0f172a !important; }
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
        .shadow-premium { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -5px rgba(0, 0, 0, 0.02) !important; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .letter-tight { letter-spacing: -0.025em; }
        .form-control-minimal { background: transparent; border: none; padding: 0.5rem 0; color: #1e293b; width: 100%; transition: all 0.2s; }
        .form-control-minimal:focus { outline: none; }
        .form-control-edit { background: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 0.75rem 1rem !important; border-radius: 12px !important; }
        .form-control-edit:focus { background: white !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; }
        .hover-translate-y:hover { transform: translateY(-3px); }
        .hover-scale:hover { transform: scale(1.05); }
        .rounded-5 { border-radius: 2rem !important; }
        .rounded-4 { border-radius: 1rem !important; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .fw-extrabold { font-weight: 800; }
        .text-amber-500 { color: #f59e0b !important; }
      `}</style>
    </div>
  );
}

function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="mb-2">
      <label className="text-secondary small d-flex align-items-center gap-2 mb-2 fw-bold tracking-wider uppercase opacity-80">
        <span className="text-primary">{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

function ModernStatRow({ label, value, unit, isEdit, field, onChange }: { label: string; value: string; unit: string; isEdit: boolean; field: string; onChange: any }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2">
      <span className="text-white text-opacity-60 fw-semibold small">{label}</span>
      {isEdit ? (
        <div className="input-group input-group-sm w-50">
          <span className="input-group-text bg-white bg-opacity-10 border-0 text-white font-mono small">{unit}</span>
          <input 
            type="number" 
            className="form-control bg-white bg-opacity-10 border-0 text-white px-3" 
            value={value} 
            onChange={(e) => onChange(field, e.target.value)} 
          />
        </div>
      ) : (
        <span className="text-white fw-extrabold fs-5">{value} <span className="small fw-medium text-white text-opacity-40">{unit}</span></span>
      )}
    </div>
  );
}

function ModernBadgeStat({ label, value, isEdit, field, onChange }: { label: string; value: string; isEdit: boolean; field: string; onChange: any }) {
  return (
    <div className="bg-white p-3 rounded-4 transition-all hover-translate-y h-100 shadow-sm border border-light">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2" style={{ fontSize: '0.6rem' }}>{label}</div>
      {isEdit ? (
        <input 
          className="form-control form-control-sm bg-light border-0 border-bottom border-primary-subtle text-navy p-0 rounded-0 fw-bold"
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

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm h-100 border border-white">
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2 font-mono" style={{ fontSize: '0.55rem' }}>{label}</div>
      {isEdit ? (
        <div className="input-group input-group-sm border-bottom border-secondary-subtle">
          <input 
            type="number" 
            className="form-control border-0 bg-transparent text-navy p-0 fw-bold" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
          />
          {unit && <span className="input-group-text border-0 bg-transparent text-muted small">{unit}</span>}
        </div>
      ) : (
        <div className={`fw-extrabold fs-4 ${textColorClass}`}>{value || "0"}<span className="small opacity-50 fw-medium ms-1">{unit}</span></div>
      )}
    </div>
  );
}
