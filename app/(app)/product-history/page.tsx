"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft, Edit, Save, Trash2,
  Loader2, AlertCircle, CheckCircle2,
  Calendar, User, Scale, Layers, Gem,
  DollarSign, AlertTriangle, Package, History, Search, ChevronRight
} from "lucide-react";
import { formatINR, formatDate, getStatusLabel, getStatusColor, getCategoryLabel } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";

export default function ProductHistoryPage() {
  const { isAdmin } = useRole();
  // ── List view state ──────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [listError, setListError] = useState("");

  // ── Detail view state ────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    lotNumber: "", itemName: "", category: "ROUGH",
    supplierName: "", created_at: "",
  });

  // ── Fetch ────────────────────────────────────────────────────
  useEffect(() => { fetchHistory(""); }, []);

  async function fetchHistory(query: string, exact = false) {
    setListError("");
    setListLoading(true);
    setIsEditMode(false);
    setDetailError("");
    setSuccess("");
    try {
      const p = new URLSearchParams();
      if (query.trim()) p.set("search", query.trim());
      if (exact) p.set("exact", "true");
      const qs = p.toString() ? `?${p.toString()}` : "";
      
      const r = await fetch(`/api/product-history${qs}`);
      if (r.ok) {
        const result = await r.json();
        setData(result);
        if (result?.lot) {
          const l = result.lot;
          setForm({
            lotNumber: l.lotNo || "",
            itemName: l.itemName || "",
            category: l.category || "ROUGH",
            supplierName: l.supplierName || "",
            created_at: l.created_at || "",
          });
        }
      } else {
        const d = await r.json();
        setListError(d.error || "Not found");
        setData(null);
      }
    } catch {
      setListError("Failed to fetch history");
      setData(null);
    } finally {
      setListLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchHistory(search);
  }

  async function handleSearchInput(value: string) {
    setSearch(value);
    if (value === "") fetchHistory("");
  }

  // ── Auto-search (live filtering) ─────────────────────────────
  useEffect(() => {
    if (!search.trim()) return; // handled instantly by handleSearchInput
    const timer = setTimeout(() => {
      fetchHistory(search);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [search]);

  function handleClear() {
    setSearch("");
    setData(null);
    setListError("");
    fetchHistory("");
  }

  // ── Save (PATCH lot) ─────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setDetailError(""); setSaving(true);
    try {
      const r = await fetch(`/api/lots/${data.lot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotNumber: form.lotNumber,
          itemName: form.itemName,
          category: form.category,
          supplierName: form.supplierName,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Failed to update");
      }
      setSuccess("Record updated successfully!");
      setIsEditMode(false);
      fetchHistory(form.lotNumber);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setDetailError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm("Delete this product record? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/lots/${data.lot.id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      handleClear();
    } catch (e: any) {
      setDetailError(e.message);
      setDeleting(false);
    }
  }

  const lot = data?.lot;
  const metrics = data?.metrics;
  const isDetail = data && data.type !== "all" && lot && metrics;
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="container-fluid p-0 min-vh-100 pb-5">
      {/* ─────────────── LIST VIEW ─────────────── */}
      {!isDetail && (
        <>
          <div className="bg-primary-gradient shadow-lg rounded-5 mx-4 mt-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-3 pb-3 border border-white border-opacity-10">
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white rounded-4 shadow-sm" style={{ width: '52px', height: '52px', minWidth: '52px' }}>
                <History className="text-white" size={24} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill font-mono shadow-sm border border-white border-opacity-20" style={{ fontSize: '0.75rem' }}>
                    Inventory
                  </span>
                  <ChevronRight className="text-white text-opacity-50" size={16} />
                  <span className="text-white text-opacity-80 small fw-bold tracking-wide">Flow tracking</span>
                </div>
                <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-md">
                  Inventory Lifecycle
                </h3>
              </div>
            </div>
          </div>

          <div className="px-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="flex-grow-1 d-flex align-items-center bg-white rounded-4 shadow-sm gap-2 border border-light"
                  style={{ padding: "12px 20px" }}
                >
                  <Search size={18} className="text-primary flex-shrink-0" />
                  <input
                    type="text"
                    name="lot-search"
                    autoComplete="off"
                    value={search}
                    onChange={e => handleSearchInput(e.target.value)}
                    placeholder="Search by Lot #, Item Name or Supplier…"
                    className="flex-grow-1 border-0 bg-transparent p-0 fw-medium"
                    style={{ outline: "none", fontSize: "1rem" }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="btn p-0 border-0 bg-transparent text-muted d-flex align-items-center fs-4"
                      aria-label="Clear search"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={listLoading}
                  className="btn btn-primary px-5 py-3 rounded-4 fw-extrabold shadow-primary-sm border-0 transition-all hover-scale d-flex align-items-center gap-2"
                >
                  {listLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Find Lot
                </button>
              </div>

              {listError && !listLoading && (
                <div className="d-flex align-items-center gap-2 mt-3 ps-2">
                  <AlertCircle size={16} className="text-danger" />
                  <span className="text-danger fw-bold small uppercase tracking-wider">{listError}</span>
                </div>
              )}
            </form>

            <div className="card shadow-premium border-0 rounded-5 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle my-0 bg-white">
                  <thead className="bg-light border-bottom">
                    <tr className="text-muted small text-uppercase tracking-widest fw-bold">
                      <th className="ps-4 py-4">Lot No</th>
                      <th className="py-4">Date</th>
                      <th className="py-4">Supplier</th>
                      <th className="py-4">Category</th>
                      <th className="text-end pe-4 py-4">Item Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                          <Loader2 size={40} className="animate-spin text-primary opacity-20 mx-auto" />
                        </td>
                      </tr>
                    ) : listError ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5">
                           <div className="text-danger fw-bold">{listError}</div>
                        </td>
                      </tr>
                    ) : !data?.lots || data.lots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-5 text-muted fst-italic">
                          No matching records found.
                        </td>
                      </tr>
                    ) : data.lots.map((l: any) => (
                      <tr key={l.id} className="transition-all">
                        <td className="ps-4 py-3">
                          <button
                            onClick={() => { setSearch(l.lotNo); fetchHistory(l.lotNo, true); }}
                            className="btn btn-link p-0 text-decoration-none font-mono fw-extrabold text-primary shadow-none fs-5 hover-translate-y d-inline-block"
                          >
                            #{l.lotNo}
                          </button>
                        </td>
                        <td className="text-muted-700 fw-medium small">{formatDate(l.date)}</td>
                        <td className="text-navy fw-bold">{l.supplierName || "—"}</td>
                        <td>
                          <span className={`badge px-3 py-2 rounded-pill small fw-extrabold shadow-sm ${
                            l.category === "ROUGH" ? "bg-indigo text-white" :
                            l.category === "READY_GOODS" ? "bg-emerald text-white" :
                            "bg-orange text-white"
                          }`}>
                            {getCategoryLabel(l.category)}
                          </span>
                        </td>
                        <td className="text-end pe-4 fw-black text-navy">{l.itemName || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────── DETAIL VIEW ─────────────── */}
      {isDetail && (
        <>
          {/* Detail Header */}
          <div className="bg-primary-gradient shadow-lg rounded-5 mx-4 mt-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3 px-4 pt-3 pb-3 border border-white border-opacity-10">
            <div className="d-flex align-items-center gap-4">
              <button 
                onClick={handleClear} 
                className="d-flex align-items-center justify-content-center bg-white bg-opacity-10 text-white rounded-4 shadow-sm transition-all hover-translate-y border border-white border-opacity-20" 
                style={{ width: '52px', height: '52px', minWidth: '52px', border: 'none' }}
              >
                <ArrowLeft className="text-white" size={24} />
              </button>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill font-mono shadow-sm border border-white border-opacity-20" style={{ fontSize: '0.75rem' }}>
                    {lot.lotNo}
                  </span>
                  <ChevronRight className="text-white text-opacity-50" size={16} />
                  <span className="text-white text-opacity-80 small fw-bold tracking-wide">Lifecycle Detail</span>
                </div>
                <h3 className="fw-extrabold text-white m-0 letter-tight drop-shadow-md">
                  {form.itemName || "Product Detail"}
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
                    <Edit size={18} /> Edit Record
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
                    onClick={() => { setIsEditMode(false); fetchHistory(search); setDetailError(""); }}
                    className="btn btn-link text-white text-opacity-80 text-decoration-none px-4 fw-bold hover-text-white"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSave}
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

          <div className="px-4">
            {/* Detail Alerts */}
            {detailError && (
              <div className="alert alert-danger p-3 d-flex align-items-center mb-4 border-0 shadow-sm rounded-4">
                <AlertCircle size={20} className="me-2 flex-shrink-0" /> {detailError}
              </div>
            )}
            {success && (
              <div className="alert alert-success p-3 d-flex align-items-center mb-4 border-0 shadow-sm rounded-4">
                <CheckCircle2 size={20} className="me-2 flex-shrink-0" /> {success}
              </div>
            )}

            <div className="row g-4">
              <div className="col-12 col-xl-8">
                {/* Basic Info Card */}
                <div className="card shadow-premium border-0 rounded-5 mb-4 overflow-hidden">
                  <div className="card-header bg-white border-bottom py-4 px-5">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-primary-subtle rounded-3 text-primary">
                        <Package size={20} />
                      </div>
                      <h5 className="fw-extrabold m-0 text-navy uppercase tracking-widest">Basic Information</h5>
                    </div>
                  </div>
                  <div className="card-body p-5">
                    <div className="row g-5">
                      <div className="col-md-6 col-lg-4">
                        <ModernField label="Lot Number" value={lot.lotNo} icon={<History size={18} />} />
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <ModernField label="Registration Date" value={formatDate(form.created_at)} icon={<Calendar size={18} />} />
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <ModernField label="Primary Supplier" icon={<User size={18} />}>
                          {isEditMode 
                            ? <input value={form.supplierName} onChange={e => f("supplierName", e.target.value)} className="form-control border-primary-subtle bg-white rounded-3 fw-bold shadow-sm" />
                            : <div className="fw-extrabold text-navy fs-4">{form.supplierName || "—"}</div>}
                        </ModernField>
                      </div>
                      <div className="col-md-6 col-lg-8">
                        <ModernField label="Product Item Name" icon={<Gem size={18} />}>
                          {isEditMode 
                            ? <input value={form.itemName} onChange={e => f("itemName", e.target.value)} className="form-control border-primary-subtle bg-white rounded-3 fw-bold shadow-sm" />
                            : <div className="fw-extrabold text-navy fs-4">{form.itemName || "—"}</div>}
                        </ModernField>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weights Card */}
                <div className="card shadow-premium border-0 rounded-5 mb-4 overflow-hidden">
                  <div className="card-header bg-white border-bottom py-4 px-5">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 bg-indigo-subtle rounded-3 text-indigo">
                        <Scale size={20} />
                      </div>
                      <h5 className="fw-extrabold m-0 text-navy uppercase tracking-widest">Inventory Weights</h5>
                    </div>
                  </div>
                  <div className="card-body p-5">
                    <div className="row g-4">
                      <div className="col-md-4">
                        <ModernStatRow label="Gross Weight" value={`${lot.purchases?.[0]?.grossWeight ?? "—"} ${lot.purchases?.[0]?.weightUnit || "G"}`} color="text-navy" />
                      </div>
                      <div className="col-md-4">
                        <ModernStatRow label="Less Weight" value={`${lot.purchases?.[0]?.lessWeight ?? "0"} ${lot.purchases?.[0]?.weightUnit || "G"}`} color="text-rose" />
                      </div>
                      <div className="col-md-4">
                        <ModernStatRow label="In-Stock Weight" value={`${metrics.currentAvailableWeight?.toFixed(3) || "0"} G`} color="text-indigo" isLarge />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="col-12 col-xl-4">
                 <div className="card shadow-premium border-0 rounded-5 bg-dark text-white overflow-hidden mb-4 sticky-top" style={{ top: '2rem' }}>
                    <div className="bg-primary-gradient p-4 text-center">
                      <div className="small font-mono opacity-75 uppercase mb-1 tracking-widest">Financial Performance</div>
                      <div className="h3 fw-black m-0 text-white letter-tight">{lot.lotNo}</div>
                    </div>
                    <div className="card-body p-4">
                       <SimpleStat label="Total Product Cost" value={formatINR(metrics.totalProductCost)} color="text-warning" />
                       <SimpleStat label="Total Revenue" value={formatINR(metrics.totalRevenue)} color="text-emerald" />
                       <hr className="border-white border-opacity-10 my-4" />
                       <div className="text-center p-4 bg-white bg-opacity-5 rounded-4">
                          <div className="small text-white text-opacity-50 uppercase tracking-widest mb-1">Net Flow</div>
                          <div className={`h2 m-0 fw-black ${metrics.netProfit >= 0 ? "text-emerald" : "text-rose"}`}>
                            {formatINR(metrics.netProfit)}
                          </div>
                          <div className="small opacity-50 mt-1">{metrics.netProfit >= 0 ? "Profit Realized" : "Loss Incurred"}</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .bg-primary-gradient { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important; }
        .bg-indigo { background-color: #4f46e5 !important; }
        .bg-indigo-subtle { background-color: #e0e7ff !important; }
        .text-indigo { color: #4f46e5 !important; }
        .bg-emerald { background-color: #10b981 !important; }
        .bg-orange { background-color: #f59e0b !important; }
        .text-navy { color: #0f172a !important; }
        .text-rose { color: #f43f5e !important; }
        .text-emerald { color: #10b981 !important; }
        .shadow-premium { box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05) !important; }
        .shadow-primary-sm { box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3) !important; }
        .rounded-5 { border-radius: 2rem !important; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .fw-extrabold { font-weight: 800; }
        .fw-black { font-weight: 900; }
        .letter-tight { letter-spacing: -0.025em; }
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        .drop-shadow-md { filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06)); }
        .hover-translate-y:hover { transform: translateY(-3px); }
        .hover-scale:hover { transform: scale(1.02); }
      `}</style>
    </div>
  );
}

function ModernField({ label, value, icon, children }: any) {
  return (
    <div className="mb-2">
      <label className="text-secondary small d-flex align-items-center gap-2 mb-2 fw-bold tracking-wider uppercase opacity-80">
        <span className="text-primary">{icon}</span> {label}
      </label>
      {children || <div className="fw-extrabold text-navy fs-4">{value}</div>}
    </div>
  );
}

function ModernStatRow({ label, value, color = "text-navy", isLarge = false }: any) {
  return (
    <div className="p-4 bg-light rounded-4 border-0 shadow-sm transition-all hover-translate-y h-100">
      <div className="small text-secondary fw-bold uppercase tracking-widest mb-2" style={{ fontSize: '0.65rem' }}>{label}</div>
      <div className={`fw-black ${isLarge ? 'fs-3' : 'fs-4'} ${color}`}>{value}</div>
    </div>
  );
}

function SimpleStat({ label, value, color = "text-white" }: any) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <span className="small opacity-60 fw-bold uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>{label}</span>
      <span className={`fw-bold font-mono fs-5 ${color}`}>{value}</span>
    </div>
  );
}
