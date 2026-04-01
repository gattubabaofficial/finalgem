"use client";

import { useState, useEffect, useCallback, use } from "react";
import { 
  AlertTriangle, 
  ArrowLeft, 
  Loader2, 
  Save, 
  Package, 
  Layers, 
  User, 
  Info,
  History,
  Tag,
  ChevronRight,
  Edit3,
  Trash2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";

interface RejectionDetailProps {
  params: Promise<{ type: string; id: string }>;
}

export default function RejectionDetailPage({ params }: RejectionDetailProps) {
  const { type, id } = use(params);
  const { isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const r = await fetch(`/api/rejection-item/${type}/${id}`);
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Rejection not found");
      setData(json);
      setStatus(json.status || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const r = await fetch(`/api/rejection-item/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Failed to update");
      setIsEditMode(false);
      fetchDetail();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this rejection entry?")) return;
    try {
      setSaving(true);
      const r = await fetch(`/api/rejection-item/${type}/${id}`, {
        method: "DELETE",
      });
      if (!r.ok) throw new Error("Failed to delete");
      window.location.href = "/rejection";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-muted fw-medium">Loading details...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="container py-5">
      <div className="alert alert-danger shadow-sm border-0 rounded-4">
        {error || "Item not found"}
      </div>
    </div>
  );

  const STATUS_OPTIONS = type === "purchase" 
    ? ["PENDING", "RETURNED", "RESELLABLE", "CLOSED"]
    : type === "manufacturing"
      ? ["REJECTED", "RETURNED_TO_MANUFACTURER", "COMPLETED"]
      : ["RETURNED", "CLOSED"];

  const netWeight = (data.grossWeight || 0) - (data.lessWeight || 0);
  const rejectedWeight = data.rejectionWeight || data.returnedWeight || 0;

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5 bg-light-subtle">
      {/* ── HEADER SECTION ─────────────────────────────────────────── */}
      <div className="gem-detail-header bg-primary-gradient shadow-lg rounded-5 mx-4 mt-4 mb-4 border border-white border-opacity-10 overflow-hidden">
        <div className="px-4 py-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
          <div className="d-flex align-items-center gap-4">
            <Link href="/rejection" className="gem-back-button shadow-sm border border-white border-opacity-20" aria-label="Go back">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill font-mono shadow-sm" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  {type.toUpperCase()} REJECTION
                </span>
                <ChevronRight className="text-white text-opacity-40" size={14} />
                <span className="text-white text-opacity-70 small fw-bold tracking-widest uppercase" style={{ fontSize: '0.65rem' }}>
                  Rejection Detail
                </span>
              </div>
              <h2 className="fw-extrabold text-white m-0 letter-tight d-flex align-items-center gap-3">
                Lot #{data.lotNo || "N/A"}
                <span className="p-2 bg-white bg-opacity-10 rounded-3 text-white-50"><Package size={20} /></span>
              </h2>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3 pe-md-2">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`btn ${isEditMode ? 'bg-white text-primary shadow-lg' : 'bg-white bg-opacity-10 text-white'} d-flex align-items-center gap-2 px-4 py-2 rounded-4 fw-bold border-0 transition-standard hover-scale`}
                >
                  <Edit3 size={18} />
                  <span>{isEditMode ? "Cancel" : "Edit Status"}</span>
                </button>

                {isEditMode && (
                  <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-4 shadow-primary-sm fw-bold border-0 transition-standard hover-scale"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Update Action</span>
                  </button>
                )}

                <button 
                  onClick={handleDelete}
                  disabled={saving}
                  className="btn btn-danger text-white d-flex align-items-center gap-2 px-4 py-2 rounded-4 shadow-sm border-0 transition-standard hover-scale"
                >
                  <Trash2 size={18} />
                  <span className="fw-bold">Remove</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 mt-2">
        <div className="row g-4">
          {/* ── LEFT COLUMN: DETAILS ─────────────────────────────────── */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-premium rounded-5 overflow-hidden mb-4">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-3 mb-5">
                  <div className="p-3 bg-primary-subtle rounded-4 text-primary shadow-sm border border-primary border-opacity-10">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h4 className="fw-extrabold m-0 text-navy tracking-tight">Primary Record</h4>
                    <p className="text-muted small m-0 uppercase fw-bold opacity-60 tracking-widest">Base transaction information</p>
                  </div>
                </div>

                <div className="row g-4 g-md-5">
                  <div className="col-md-6">
                    <ModernField label="Reference Name" value={data.supplierName || data.soldTo || data.reason || "—"} icon={<User size={18} />} />
                  </div>
                  <div className="col-md-6">
                    <ModernField label="Item / Type" value={data.itemName || type} icon={<Tag size={18} />} />
                  </div>
                  <div className="col-md-6">
                    <ModernField label="Transaction Date" value={formatDate(data.date)} icon={<History size={18} />} />
                  </div>
                  <div className="col-md-6">
                    <ModernField label="Current Status" icon={<AlertTriangle size={18} />}>
                      {isEditMode ? (
                        <select 
                          value={status} 
                          onChange={(e) => setStatus(e.target.value)}
                          className="form-select border-primary-subtle bg-white rounded-3 fw-bold text-primary shadow-sm py-2"
                        >
                          {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                        </select>
                      ) : (
                        <div className="mt-1">
                          <span className={`badge ${status === 'PENDING' ? 'bg-warning text-dark' : status === 'RETURNED' ? 'bg-info text-white' : status === 'RESELLABLE' ? 'bg-success text-white' : status === 'REJECTED' || status === 'CLOSED' ? 'bg-danger text-white' : 'bg-primary text-white'} px-4 py-2 rounded-pill fw-bold tracking-tight shadow-sm`}>
                            {status.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                    </ModernField>
                  </div>
                </div>

                {data.memo && (
                  <div className="mt-5 p-4 bg-light rounded-5 border-start border-primary border-5 shadow-sm">
                    <div className="d-flex align-items-center gap-2 mb-2">
                       <Info className="text-primary opacity-60" size={16} />
                       <span className="small fw-bold text-primary uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>Memo / Notes</span>
                    </div>
                    <p className="m-0 text-dark fw-medium lh-base opacity-80" style={{ fontSize: '0.95rem' }}>{data.memo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejected Metrics Summary */}
            <div className="card border-0 shadow-premium rounded-5 bg-rose-subtle-25 border border-rose border-opacity-10 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-3 mb-4 pb-2">
                  <div className="p-2 bg-rose rounded-3 text-white shadow-sm flex-shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <h5 className="m-0 fw-extrabold uppercase text-rose tracking-wider">Rejected Metrics</h5>
                </div>
                <div className="row g-4">
                  <div className="col-sm-6 col-md-3">
                    <ModernSmallField label="Weight" value={data.rejectionWeight || data.returnedWeight || 0} unit={data.weightUnit} accent="rose" />
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <ModernSmallField label="Pieces" value={data.rejectionPieces || data.returnedPieces || "—"} accent="rose" />
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <ModernSmallField label="Lines" value={data.rejectionLines || data.returnedLines || "—"} accent="rose" />
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <ModernSmallField label="Return Date" value={data.rejectionDate ? formatDate(data.rejectionDate) : "—"} accent="rose" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SIDEBAR ────────────────────────────────── */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '2rem', zIndex: 100 }}>
              <div className="card border-0 shadow-premium rounded-5 bg-navy text-white overflow-hidden mb-4">
                <div className="bg-primary-gradient p-5 text-center position-relative">
                  <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)' }}></div>
                  <div className="small font-mono opacity-70 uppercase mb-2 tracking-widest fw-bold" style={{ fontSize: '0.65rem' }}>Inventory Impact Analysis</div>
                  <div className="h3 fw-extrabold m-0 text-white letter-tight tracking-tight drop-shadow-sm">
                    Lot #{data.lotNo}
                  </div>
                </div>
                <div className="card-body p-5">
                  <div className="space-y-4">
                    {type === "purchase" && (
                       <>
                          <ModernStatRow label="Gross weight" value={`${data.grossWeight || 0} ${data.weightUnit || ""}`} />
                          <ModernStatRow label="Less weight" value={`${data.lessWeight || 0} ${data.weightUnit || ""}`} color="text-rose" />
                          <ModernStatRow label="Net purchase" value={`${netWeight.toFixed(3)} ${data.weightUnit || ""}`} color="text-warning" isLarge />
                          
                          <div className="mt-5 pt-4 border-top border-white border-opacity-10">
                            <ModernStatRow label="Rejected" value={`${rejectedWeight.toFixed(3)} ${data.weightUnit || ""}`} color="text-rose" />
                            <ModernStatRow label="Final Selection" value={`${(netWeight - rejectedWeight).toFixed(3)} ${data.weightUnit || ""}`} color="text-emerald" isLarge />
                          </div>
                       </>
                    )}
                    {data.netSale && (
                       <ModernStatRow label="Original sale value" value={`₹ ${data.netSale.toLocaleString()}`} color="text-warning" isLarge />
                    )}
                    
                    <div className="alert bg-white bg-opacity-5 border border-white border-opacity-10 rounded-4 text-white-50 mt-5 mb-0 p-4 shadow-sm">
                      <div className="d-flex align-items-start gap-3">
                        <div className="p-2 bg-warning bg-opacity-20 rounded-3 text-warning">
                          <Info size={18} />
                        </div>
                        <div className="small lh-base">
                          <strong className="d-block mb-1 text-warning uppercase fw-extrabold tracking-widest" style={{ fontSize: '0.65rem' }}>Status Impact</strong>
                          Updating the status affects physical stock reconciliation. <strong className="text-white">RETURNED</strong> marks this for ship-back.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-navy { background-color: #0f172a !important; }
        .text-navy { color: #0f172a !important; }
        .text-rose { color: #f43f5e !important; }
        .bg-rose { background-color: #f43f5e !important; }
        .shadow-premium { box-shadow: 0 10px 35px -10px rgba(0,0,0,0.08) !important; }
        .shadow-primary-sm { box-shadow: 0 4px 15px 0 rgba(79, 70, 229, 0.4) !important; }
        .bg-rose-subtle-25 { background-color: rgba(244, 63, 94, 0.03) !important; }
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important; }
        .bg-primary-subtle { background-color: rgba(79, 70, 229, 0.1) !important; }
        .rounded-5 { border-radius: 1.75rem !important; }
        .rounded-4 { border-radius: 1.1rem !important; }
        .fw-extrabold { font-weight: 800; }
        .letter-tight { letter-spacing: -0.03em; }
        .drop-shadow-sm { filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1)); }
        .transition-standard { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-scale:hover:not(:disabled) { transform: scale(1.02); filter: brightness(1.1); }
        .hover-translate-y:hover { transform: translateY(-3px); }
        .uppercase { text-transform: uppercase; }
        .font-mono { font-family: 'JetBrains Mono', 'Roboto Mono', monospace; }
        .tracking-tight { letter-spacing: -0.01em; }
        .space-y-4 > * + * { margin-top: 1.25rem; }
      `}</style>
    </div>
  );
}

function ModernField({ label, value, icon, children }: any) {
  return (
    <div className="mb-2 group">
      <label className="text-secondary small d-flex align-items-center gap-2 mb-2 fw-bold tracking-widest uppercase opacity-60" style={{ fontSize: '0.65rem' }}>
        <span className="text-primary">{icon}</span> {label}
      </label>
      {children || <div className="fw-extrabold text-navy fs-4 tracking-tight">{value}</div>}
    </div>
  );
}

function ModernSmallField({ label, value, unit, accent }: any) {
  const isRose = accent === 'rose';
  const textColorClass = isRose ? 'text-rose' : 'text-primary';
  const bgColorClass = isRose ? 'bg-white' : 'bg-white';
  
  return (
    <div className={`${bgColorClass} p-4 rounded-4 shadow-sm h-100 border border-light border-opacity-50 transition-standard hover-translate-y border-bottom-rose`}>
      <div className="text-secondary small fw-bold uppercase tracking-widest mb-2 opacity-50" style={{ fontSize: '0.6rem' }}>{label}</div>
      <div className={`fw-extrabold fs-4 ${textColorClass} letter-tight`}>
        {value || "0"}
        {unit && <span className="small opacity-50 fw-bold ms-1" style={{ fontSize: '0.75rem' }}>{unit}</span>}
      </div>
      <style jsx>{`
        .border-bottom-rose { border-bottom: 3px solid ${isRose ? '#f43f5e' : '#4f46e5'}20 !important; }
      `}</style>
    </div>
  );
}

function ModernStatRow({ label, value, color = "text-white", isLarge = false }: any) {
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom border-white border-opacity-5 pb-3 mb-3 last:border-0 last:mb-0">
      <span className="small opacity-50 fw-bold uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>{label}</span>
      <span className={`fw-extrabold font-mono ${isLarge ? 'fs-3' : 'fs-5'} ${color} letter-tight`}>{value}</span>
    </div>
  );
}
