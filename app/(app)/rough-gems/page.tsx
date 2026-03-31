"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Search, Loader2, Gem, Weight, Tag
} from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel, getCategoryLabel } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";
import Link from "next/link";

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "READY", label: "Ready" },
  { value: "PARTIALLY_SOLD", label: "Partially Sold" },
  { value: "IN_STOCK", label: "In Stock" },
];

const STATUS_STYLE: Record<string, string> = {
  READY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PARTIALLY_SOLD: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  IN_STOCK: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

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

export default function RoughGemsPage() {
  const [items, setItems] = useState<SubLot[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<SubLot | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const params = new URLSearchParams({ search, category: "ROUGH", status });
      const r = await fetch(`/api/finished-goods?${params}`);
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        const msg = errorData.error || r.statusText;
        console.error("Failed to fetch rough gems:", msg);
        setApiError(msg);
        setItems([]);
      } else {
        const data = await r.json();
        if (Array.isArray(data)) {
          setItems(data);
          setTotal(data.length);
          setSummary(null);
        } else {
          setItems(data.subLots || []);
          setTotal(data.total || 0);
          setSummary(data.summary || null);
        }
      }
    } catch (err) {
      console.error("Error fetching rough gems:", err);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      {/* Header */}
      <div className="gem-page-header">
        <div>
          <h1><Gem size={20} /> Rough Gems</h1>
          <p>Inventory of rough goods · {total} items</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Total Available</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-primary">
                    <Package className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.totalAvailable ?? "—"}</h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Ready</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-success">
                    <Gem className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.readyCount ?? "—"}</h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Partially Sold</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-warning">
                    <Tag className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.partiallySoldCount ?? "—"}</h1>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xxl-3 d-flex">
          <div className="card flex-fill">
            <div className="card-body">
              <div className="row">
                <div className="col mt-0">
                  <h5 className="card-title">Total Weight (g)</h5>
                </div>
                <div className="col-auto">
                  <div className="stat text-danger">
                    <Weight className="align-middle" />
                  </div>
                </div>
              </div>
              <h1 className="mt-1 mb-3">{summary?.totalWeight != null ? summary.totalWeight.toFixed(2) : "—"}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="row g-3 items-center">
            <div className="col-12 col-md-auto max-w-sm">
              <div className="input-group">
                <span className="input-group-text"><Search className="w-4 h-4" /></span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lot no, item, shape..."
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-12 col-md-auto ms-auto d-flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select w-auto"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
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

      {/* Table */}
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
                <tr><td colSpan={4} className="text-center py-5 text-muted">No inventory records found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4">
                      <Link
                        href={`/rough-gems/${item.id}`}
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
