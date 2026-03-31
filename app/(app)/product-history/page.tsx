"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft, Edit, Save, Trash2,
  Loader2, AlertCircle, CheckCircle2,
  Calendar, User, Scale, Layers, Gem,
  DollarSign, AlertTriangle, Package, History, Search
} from "lucide-react";
import { formatINR, formatDate, getStatusLabel, getStatusColor, getCategoryLabel } from "@/lib/utils";

export default function ProductHistoryPage() {
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
    <div>

      {/* ─────────────── LIST VIEW ─────────────── */}
      {!isDetail && (
        <div>
          <div className="gem-page-header">
            <div>
              <h1><History size={20} /> Inventory Lifecycle</h1>
              <p>Detailed history and flow tracking for all product lots</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="d-flex align-items-center gap-3">
              {/* Input pill */}
              <div
                className="flex-grow-1 d-flex align-items-center bg-white rounded-3 shadow-sm gap-2 border"
                style={{ padding: "10px 16px" }}
              >
                <Search size={18} className="text-muted flex-shrink-0" />
                <input
                  type="text"
                  name="lot-search"
                  autoComplete="off"
                  value={search}
                  onChange={e => handleSearchInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); fetchHistory(search); } }}
                  placeholder="Search by Lot #, Item Name or Supplier…"
                  className="flex-grow-1 border-0 bg-transparent p-0"
                  style={{ outline: "none", fontSize: "0.95rem" }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn p-0 border-0 bg-transparent text-muted d-flex align-items-center"
                    style={{ lineHeight: 1, fontSize: "1.1rem" }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              {/* Search button */}
              <button
                type="submit"
                disabled={listLoading}
                className="btn btn-primary px-4 fw-semibold rounded-3 flex-shrink-0 d-flex align-items-center gap-2"
                style={{ padding: "10px 20px" }}
              >
                {listLoading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Search size={16} />}
                Search
              </button>
            </div>

            {/* Error feedback */}
            {listError && !listLoading && (
              <div className="d-flex align-items-center gap-2 mt-2 ps-1">
                <AlertCircle size={14} className="text-danger" />
                <span className="text-danger small">{listError}</span>
              </div>
            )}
          </form>

          <div className="card shadow-sm border-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle my-0 bg-white">
                <thead className="bg-light border-bottom">
                  <tr className="text-muted small text-uppercase">
                    <th className="ps-4 py-3 fw-semibold">Lot No</th>
                    <th className="py-3 fw-semibold">Date</th>
                    <th className="py-3 fw-semibold">Supplier</th>
                    <th className="py-3 fw-semibold">Type</th>
                    <th className="text-end pe-4 py-3 fw-semibold">Item Name</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr><td colSpan={5} className="text-center py-5">
                      <Loader2 size={32} className="animate-spin text-primary opacity-30 mx-auto d-block" />
                    </td></tr>
                  ) : listError ? (
                    <tr><td colSpan={5} className="text-center py-5 text-danger">{listError}</td></tr>
                  ) : !data?.lots || data.lots.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-5 text-muted fst-italic">No inventory items found.</td></tr>
                  ) : data.lots.map((l: any) => (
                    <tr key={l.id}>
                      <td className="ps-4 py-3">
                        <button
                          onClick={() => { setSearch(l.lotNo); fetchHistory(l.lotNo, true); }}
                          className="btn btn-link p-0 text-decoration-none font-monospace fw-bold shadow-none"
                        >
                          {l.lotNo}
                        </button>
                      </td>
                      <td className="text-muted small">{formatDate(l.date)}</td>
                      <td className="text-muted">{l.supplierName || "—"}</td>
                      <td>
                        <span className={`badge px-2 py-1 small fw-semibold ${
                          l.category === "ROUGH"       ? "bg-primary bg-opacity-10 text-primary" :
                          l.category === "READY_GOODS" ? "bg-success bg-opacity-10 text-success" :
                          "bg-warning bg-opacity-10 text-warning"
                        }`}>
                          {getCategoryLabel(l.category)}
                        </span>
                      </td>
                      <td className="text-end pe-4 fw-semibold">{l.itemName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── DETAIL VIEW ─────────────── */}
      {isDetail && (
        <>
          {/* Header — no extra wrapper, matches rough-gems/[id] exactly */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
              <button onClick={handleClear} className="btn btn-light btn-sm rounded-circle p-2 shadow-sm">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Gem size={20} className="text-primary" />
                  <span className="text-primary font-monospace">{lot.lotNo}</span>
                </h1>
                <p className="text-muted small mb-0">
                  {form.itemName || "Product"} · {getCategoryLabel(form.category)}
                </p>
              </div>
            </div>

            <div className="d-flex gap-2">
              {!isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(true)} className="btn btn-primary shadow-sm d-flex align-items-center gap-2 fw-semibold">
                    <Edit size={16} /> Edit Record
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="btn btn-danger shadow-sm d-flex align-items-center gap-2 fw-semibold">
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </>
              ) : (
                <button onClick={() => { setIsEditMode(false); fetchHistory(search); setDetailError(""); }} className="btn btn-light shadow-sm">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Alerts */}
          {detailError && (
            <div className="alert alert-danger p-3 d-flex align-items-center mb-4 border-0 shadow-sm">
              <AlertCircle size={20} className="me-2 flex-shrink-0" /> {detailError}
            </div>
          )}
          {success && (
            <div className="alert alert-success p-3 d-flex align-items-center mb-4 border-0 shadow-sm">
              <CheckCircle2 size={20} className="me-2 flex-shrink-0" /> {success}
            </div>
          )}

          <form id="editForm" onSubmit={handleSave}>
            <div className="row g-4">
              {/* ── LEFT: Core Details ── */}
              <div className="col-12 col-xl-8">

                {/* Basic Information */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
                    <Package size={20} className="text-primary me-2" />
                    <h5 className="card-title fw-bold mb-0">Basic Information</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <Field label="Lot No" className="col-md-4">
                        <div className="p-2 bg-light rounded font-monospace fw-bold text-primary">{lot.lotNo}</div>
                      </Field>
                      <Field label="Date" className="col-md-4">
                        <div className="p-2 bg-light rounded d-flex align-items-center">
                          <Calendar size={16} className="me-2 text-muted" />
                          {formatDate(form.created_at)}
                        </div>
                      </Field>
                      <Field label="Supplier" className="col-md-4">
                        {isEditMode
                          ? <input value={form.supplierName} onChange={e => f("supplierName", e.target.value)} className="form-control" />
                          : <div className="p-2 bg-light rounded d-flex align-items-center"><User size={16} className="me-2 text-muted" />{form.supplierName || "—"}</div>
                        }
                      </Field>
                      <Field label="Item Name" className="col-md-6">
                        {isEditMode
                          ? <input value={form.itemName} onChange={e => f("itemName", e.target.value)} className="form-control" />
                          : <div className="p-2 bg-light rounded">{form.itemName || "—"}</div>
                        }
                      </Field>
                      <Field label="Purchase Price (₹)" className="col-md-6">
                        <div className="p-2 bg-light rounded fw-bold text-warning">
                          {lot.purchases?.[0]?.purchasePrice ? formatINR(lot.purchases[0].purchasePrice) : formatINR(metrics.totalProductCost)}
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Weight Details */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
                    <Scale size={20} className="text-primary me-2" />
                    <h5 className="card-title fw-bold mb-0">Weight Details</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <Field label="Gross Weight" className="col-md-4">
                        <div className="p-2 bg-light rounded fw-bold">
                          {lot.purchases?.[0]?.grossWeight ?? "—"} {lot.purchases?.[0]?.weightUnit || "G"}
                        </div>
                      </Field>
                      <Field label="Less Weight" className="col-md-4">
                        <div className="p-2 bg-light rounded">
                          {lot.purchases?.[0]?.lessWeight ?? "0"} {lot.purchases?.[0]?.weightUnit || "G"}
                        </div>
                      </Field>
                      <Field label="Net Weight" className="col-md-4">
                        <div className="p-2 bg-primary bg-opacity-10 rounded fw-bold text-primary">
                          {((lot.purchases?.[0]?.grossWeight || 0) - (lot.purchases?.[0]?.lessWeight || 0)).toFixed(3)} {lot.purchases?.[0]?.weightUnit || "G"}
                        </div>
                      </Field>

                      <div className="col-12"><hr className="text-secondary opacity-25 my-1" /></div>
                      <p className="small fw-bold text-success text-uppercase mb-0 px-3">Selection</p>
                      <Field label="Selection Weight" className="col-md-4">
                        <div className="p-2 bg-success bg-opacity-10 text-success rounded fw-bold">
                          {metrics.currentAvailableWeight?.toFixed(3) || "—"} G
                        </div>
                      </Field>
                      <Field label="Manufacturing Steps" className="col-md-4">
                        <div className="p-2 bg-light rounded">{lot.manufacturing?.length ?? "0"}</div>
                      </Field>
                      <Field label="Sales Count" className="col-md-4">
                        <div className="p-2 bg-light rounded">{lot.sales?.length ?? "0"}</div>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Physical Specs / Category */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-header bg-white border-bottom py-3 d-flex align-items-center">
                    <Layers size={20} className="text-primary me-2" />
                    <h5 className="card-title fw-bold mb-0">Classification & Specs</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <Field label="Category" className="col-md-4">
                        {isEditMode
                          ? <select value={form.category} onChange={e => f("category", e.target.value)} className="form-select">
                              <option value="ROUGH">Rough</option>
                              <option value="READY_GOODS">Ready Goods</option>
                              <option value="BY_ORDER">By Order</option>
                            </select>
                          : <div className="p-2 bg-light rounded">{getCategoryLabel(form.category)}</div>
                        }
                      </Field>
                      <Field label="Total Revenue" className="col-md-4">
                        <div className="p-2 bg-light rounded fw-bold text-success">{formatINR(metrics.totalRevenue)}</div>
                      </Field>
                      <Field label="Net Profit / Loss" className="col-md-4">
                        <div className={`p-2 bg-light rounded fw-bold ${metrics.netProfit >= 0 ? "text-success" : "text-danger"}`}>
                          {formatINR(metrics.netProfit)}
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── RIGHT: Status + Lifecycle ── */}
              <div className="col-12 col-xl-4">

                {/* Status Card */}
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4 text-center">
                    <Gem size={32} className="text-primary mx-auto mb-2" />
                    <div className="mb-3">
                      <span className="text-muted small">Lot Status</span>
                      <div className="mt-1">
                        <span className={`badge px-3 py-2 fs-6 bg-${getStatusColor(lot.sales?.length > 0 ? "SOLD" : "IN_STOCK")} text-white`}>
                          {lot.sales?.length > 0 ? "Sold" : "In Process"}
                        </span>
                      </div>
                    </div>
                    {lot.lotNo && (
                      <div className="p-2 bg-light rounded mt-2">
                        <span className="small text-muted">Lot No</span>
                        <div className="font-monospace fw-bold text-primary">{lot.lotNo}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection / Lifecycle Card */}
                <div className="card shadow-sm border-0 border-danger border-opacity-25">
                  <div className="card-header bg-danger bg-opacity-10 border-bottom border-danger border-opacity-25 py-3 d-flex align-items-center">
                    <AlertTriangle size={20} className="text-danger me-2" />
                    <h5 className="card-title fw-bold mb-0 text-danger">Rejection Info</h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-3">
                      <Field label="Rejection Weight" className="col-12">
                        <div className="p-2 bg-light rounded text-danger fw-bold">
                          {lot.purchases?.[0]?.rejectionWeight || "0"} {lot.purchases?.[0]?.weightUnit || "G"}
                        </div>
                      </Field>
                      <Field label="Rejection Pieces" className="col-6">
                        <div className="p-2 bg-light rounded">{lot.purchases?.[0]?.rejectionPieces || "—"}</div>
                      </Field>
                      <Field label="Rejection Lines" className="col-6">
                        <div className="p-2 bg-light rounded">{lot.purchases?.[0]?.rejectionLines || "—"}</div>
                      </Field>
                      <Field label="Return Date" className="col-6">
                        <div className="p-2 bg-light rounded">
                          {lot.purchases?.[0]?.rejectionDate ? formatDate(lot.purchases[0].rejectionDate) : "—"}
                        </div>
                      </Field>
                      <Field label="Rejection Status" className="col-6">
                        <span className={`badge px-3 py-2 d-inline-block mt-1 ${
                          lot.purchases?.[0]?.rejectionStatus === "RETURNED"   ? "bg-info text-white"
                          : lot.purchases?.[0]?.rejectionStatus === "RESELLABLE" ? "bg-success text-white"
                          : lot.purchases?.[0]?.rejectionStatus === "CLOSED"     ? "bg-secondary text-white"
                          : "bg-warning text-dark"
                        }`}>
                          {lot.purchases?.[0]?.rejectionStatus || "PENDING"}
                        </span>
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
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </>
      )}
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
