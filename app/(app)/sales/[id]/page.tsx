"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { 
  ArrowLeft, Edit, Save, Trash2, 
  Loader2, AlertCircle, CheckCircle2,
  Calendar, User, Tag, Receipt,
  Activity, Info, ChevronRight
} from "lucide-react";
import { formatINR, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Link from "next/link";

interface Params {
  id: string;
}

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
  
  const [form, setForm] = useState({
    lotNo: "", date: "", customer: "", billNo: "",
    salePrice: "", discount: "0", tax: "0", netSale: "0", finalBillAmount: "0",
    itemName: "", descriptionRef: "", status: "SOLD",
    weight: "", weightUnit: "G", pieces: "", shape: "", size: "", lines: "", length: ""
  });

  const fetchSale = async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/sales/${id}`);
      if (!r.ok) throw new Error("Failed to fetch sale record");
      const data = await r.json();
      
      setForm({
        lotNo: data.lot?.lotNumber || "",
        date: data.date ? data.date.slice(0, 10) : "",
        customer: data.customerName || data.customer || "",
        billNo: data.billNo || "",
        salePrice: data.salePrice?.toString() || "",
        discount: data.discount?.toString() || "0",
        tax: data.tax?.toString() || "0",
        netSale: data.netSale?.toString() || "0",
        finalBillAmount: data.finalBillAmount?.toString() || "0",
        itemName: data.itemName || "",
        descriptionRef: data.descriptionRef || "",
        status: data.lot?.status || "SOLD",
        weight: data.weight?.toString() || "",
        weightUnit: data.weightUnit || "G",
        pieces: data.pieces?.toString() || "",
        shape: data.shape || "",
        size: data.size || "",
        lines: data.lines?.toString() || "",
        length: data.length?.toString() || ""
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSale(); }, [id]);

  const f = (k: string, v: string) => setForm((p) => {
    const next = { ...p, [k]: v };
    if (k === "salePrice" || k === "discount" || k === "tax") {
      const sp = parseFloat(next.salePrice || "0");
      const ds = parseFloat(next.discount || "0");
      const tx = parseFloat(next.tax || "0");
      const ns = sp - ds;
      next.netSale = ns.toString();
      next.finalBillAmount = (ns + tx).toString();
    }
    return next;
  });

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const r = await fetch(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salePrice: parseFloat(form.salePrice),
          discount: parseFloat(form.discount),
          tax: parseFloat(form.tax),
          weight: parseFloat(form.weight || "0"),
          pieces: form.pieces ? parseInt(form.pieces) : undefined,
          lines: form.lines ? parseInt(form.lines) : undefined,
          length: form.length ? parseFloat(form.length) : undefined,
        }),
      });
      if (!r.ok) throw new Error("Failed to update sale");
      setSuccess("Sale updated successfully!");
      setIsEditMode(false);
      fetchSale();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this sale? This will revert the sub-lot status to READY.")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete sale");
      router.push("/sales");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
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
                {form.lotNo}
              </span>
              <ChevronRight className="text-white text-opacity-50" size={16} />
              <span className="text-white text-opacity-80 small fw-bold tracking-wide">Sale Detail</span>
            </div>
            <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-md">
              {form.itemName || "Sale Transaction"}
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

      {error && <div className="alert alert-danger mb-4 shadow-sm border-0">{error}</div>}
      {success && <div className="alert alert-success mb-4 shadow-sm border-0">{success}</div>}

      <div className="row g-4 font-inter">
        {/* Left Column - Details */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h5 className="card-title fw-bold mb-0">Transaction Information</h5>
              <div className="ms-auto">
                <span className={`badge bg-${getStatusColor(form.status)} text-white px-2 py-1 rounded-pill`}>
                  {getStatusLabel(form.status)}
                </span>
              </div>
            </div>
            <div className="card-body p-4">
              <form id="editForm" onSubmit={handleUpdate} className="row g-4">
                <div className="col-md-6">
                  <Field label="Customer Name" icon={<User className="w-4 h-4" />}>
                    {isEditMode ? <input value={form.customer} onChange={(e) => f("customer", e.target.value)} className="form-control" /> : <div className="p-3 bg-light rounded text-dark fw-bold">{form.customer || "—"}</div>}
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Bill Number" icon={<Receipt className="w-4 h-4" />}>
                    {isEditMode ? <input value={form.billNo} onChange={(e) => f("billNo", e.target.value)} className="form-control" /> : <div className="p-3 bg-light rounded text-dark fw-bold">{form.billNo || "—"}</div>}
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Sale Date" icon={<Calendar className="w-4 h-4" />}>
                    {isEditMode ? <input type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="form-control" /> : <div className="p-3 bg-light rounded">{formatDate(form.date)}</div>}
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Item Name" icon={<Tag className="w-4 h-4" />}>
                    {isEditMode ? <input value={form.itemName} onChange={(e) => f("itemName", e.target.value)} className="form-control" /> : <div className="p-3 bg-light rounded">{form.itemName || "—"}</div>}
                  </Field>
                </div>

                <div className="col-12"><hr className="opacity-10" /></div>

                <div className="col-12">
                  <h6 className="fw-bold text-muted text-uppercase mb-3 small">Product Specs</h6>
                  <div className="row g-3">
                    <Field label="Weight" className="col-md-4">
                      <div className="p-3 bg-light rounded d-flex justify-content-between align-items-center">
                        <span className="fw-bold fs-5">{form.weight} <small className="text-muted fw-normal">{form.weightUnit}</small></span>
                      </div>
                    </Field>
                    <Field label="Pieces" className="col-md-4">
                      <div className="p-3 bg-light rounded text-dark fw-bold fs-5">{form.pieces || "—"}</div>
                    </Field>
                    <Field label="Details" className="col-md-4">
                      <div className="p-3 bg-light rounded text-muted small">
                        {form.shape} {form.size} {form.lines ? `| ${form.lines} lines` : ""}
                      </div>
                    </Field>
                  </div>
                </div>

                <div className="col-12">
                  <Field label="Description / Notes" icon={<Info className="w-4 h-4" />}>
                    {isEditMode ? <textarea rows={3} value={form.descriptionRef} onChange={(e) => f("descriptionRef", e.target.value)} className="form-control" /> : <div className="p-3 bg-light rounded text-muted">{form.descriptionRef || "No notes."}</div>}
                  </Field>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Financials */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="card-title fw-bold mb-0">Financial Summary</h5>
            </div>
            <div className="card-body p-4 bg-light bg-opacity-50">
              <div className="space-y-4">
                <Field label="Sale Price">
                  {isEditMode ? <input type="number" value={form.salePrice} onChange={(e) => f("salePrice", e.target.value)} className="form-control" /> : <div className="fs-4 fw-bold text-dark">{formatINR(parseFloat(form.salePrice || "0"))}</div>}
                </Field>
                <Field label="Discount">
                  {isEditMode ? <input type="number" value={form.discount} onChange={(e) => f("discount", e.target.value)} className="form-control" /> : <div className="text-danger fw-semibold">-{formatINR(parseFloat(form.discount || "0"))}</div>}
                </Field>
                <Field label="Tax">
                  {isEditMode ? <input type="number" value={form.tax} onChange={(e) => f("tax", e.target.value)} className="form-control" /> : <div className="text-primary fw-semibold">+{formatINR(parseFloat(form.tax || "0"))}</div>}
                </Field>
                
                <hr className="opacity-10" />

                <div className="p-4 bg-primary rounded-4 text-white text-center shadow-sm">
                  <div className="small opacity-75 uppercase fw-bold mb-1">Final Bill Amount</div>
                  <div className="h3 fw-extrabold m-0 font-monospace">
                    {formatINR(parseFloat(form.finalBillAmount || "0"))}
                  </div>
                </div>
              </div>
            </div>
            {isEditMode && (
              <div className="card-footer p-4 bg-white border-top">
                <button type="submit" form="editForm" disabled={saving} className="btn btn-primary w-100 py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 fw-bold">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Updating..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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

function Field({ label, children, icon, className = "" }: { label: string; children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="form-label mb-2 text-muted fw-bold small uppercase d-flex align-items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
