"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Search, Loader2, Gem, Weight, Tag } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel, getCategoryLabel } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = ["", "ROUGH", "READY_GOODS", "BY_ORDER"] as const;
const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "READY", label: "Ready" },
  { value: "PARTIALLY_SOLD", label: "Partially Sold" },
  { value: "IN_STOCK", label: "In Stock" },
];

type SubLot = {
  id: string;
  subLotNo: string;
  lotId: string;
  status: string;
  weight: number;
  weightUnit: string;
  pieces: number | null;
  shape: string | null;
  size: string | null;
  lines: number | null;
  length: number | null;
  updatedAt: string;
  purchaseDate: string;
  purchasePrice: number;
  totalCost: number;
  rejectionWeight: number | null;
  rejectionPieces: number | null;
  rejectionStatus: string | null;
  lot: {
    lotNumber: string;
    itemName: string | null;
    category: string;
    supplierName: string | null;
    grossWeight: number;
    netWeight: number;
  };
  manufacturing: Array<{ totalManufacturingCost: number }>;
  sales: Array<{ finalBillAmount: number }>;
};

export default function FinishedGoodsPage() {
  const [items, setItems] = useState<SubLot[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const params = new URLSearchParams({ search, category, status, excludeCategory: "ROUGH" });
      const r = await fetch(`/api/finished-goods?${params}`);
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        setApiError(errorData.error || r.statusText);
        setItems([]);
      } else {
        const data = await r.json();
        if (Array.isArray(data)) {
          setItems(data); setTotal(data.length); setSummary(null);
        } else {
          setItems(data.subLots || []); setTotal(data.total || 0); setSummary(data.summary || null);
        }
      }
    } catch (err) {
      console.error("Error fetching finished goods:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      {/* Header */}
      <div className="gem-page-header">
        <div>
          <h1><Gem size={20} /> Finished Goods</h1>
          <p>All products available for sale · {total} items</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        {[
          { title: "Total Available", val: summary?.totalAvailable, cls: "text-primary", Icon: Package },
          { title: "Ready", val: summary?.readyCount, cls: "text-success", Icon: Gem },
          { title: "Partially Sold", val: summary?.partiallySoldCount, cls: "text-warning", Icon: Tag },
          { title: "Total Weight (g)", val: summary?.totalWeight != null ? summary.totalWeight.toFixed(2) : undefined, cls: "text-danger", Icon: Weight },
        ].map(({ title, val, cls, Icon }) => (
          <div key={title} className="col-12 col-sm-6 col-xxl-3 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="row">
                  <div className="col mt-0"><h5 className="card-title">{title}</h5></div>
                  <div className="col-auto"><div className={`stat ${cls}`}><Icon className="align-middle" /></div></div>
                </div>
                <h1 className="mt-1 mb-3">{val ?? "—"}</h1>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="row g-3 items-center">
            <div className="col-12 col-md-auto max-w-sm">
              <div className="input-group">
                <span className="input-group-text"><Search className="w-4 h-4" /></span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lot no, item, shape..." className="form-control" />
              </div>
            </div>
            <div className="col-12 col-md-auto ms-auto d-flex gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select w-auto">
                <option value="">All Categories</option>
                {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select w-auto">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="alert alert-danger shadow-sm border-0 rounded-4 mb-3">
          <strong>Database Error:</strong> {apiError}
        </div>
      )}

      {/* Table — 4 columns */}
      <div className="card flex-fill w-100">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th className="ps-4">Lot No</th>
                <th>Date</th>
                <th>Supplier</th>
                <th className="text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-5"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-20" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-5 text-muted">No finished goods found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4">
                      <Link
                        href={`/finished-goods/${item.id}`}
                        className="font-monospace text-primary fw-bold text-decoration-none border-bottom border-primary border-opacity-25 pb-1 fs-5"
                      >
                        {item.lot?.lotNumber || "N/A"}
                      </Link>
                    </td>
                    <td className="text-muted small text-nowrap">{formatDate(item.purchaseDate || item.updatedAt)}</td>
                    <td className="text-muted">{item.lot.supplierName || "—"}</td>
                    <td className="text-end pe-4">
                      <span className={`badge bg-${getStatusColor(item.status)} text-white px-3 py-2 rounded-pill`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
