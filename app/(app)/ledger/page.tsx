"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type LedgerEntry = {
  id: string;
  created_at: string;
  product: { name: string } | null;
  transaction_type: string;
  quantity: number;
  reference_id: string;
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refType, setRefType] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (refType) params.set("transactionType", refType);
    const r = await fetch(`/api/ledger?${params}`);
    const data = await r.json();
    setEntries(data.entries || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [refType]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="gem-page-header" style={{ padding: '0 16px' }}>
        <div>
          <h1><BookOpen size={20} /> Stock Ledger</h1>
          <p>Complete audit trail of all inventory movements ({total} entries)</p>
        </div>
      </div>

        {/* ── FILTERS ── */}
        <div className="card mb-4 shadow-sm border-0 rounded-4">
          <div className="card-body p-3">
            <div className="d-flex align-items-center bg-white rounded-3 shadow-sm border border-light" style={{ padding: "8px 16px", maxWidth: "400px" }}>
              <Search size={18} className="text-muted flex-shrink-0 me-3" />
              <select 
                value={refType} 
                onChange={(e) => setRefType(e.target.value)} 
                className="form-select border-0 bg-transparent shadow-none p-0 pe-4"
                style={{ outline: "none", cursor: "pointer", fontWeight: 500 }}
              >
                <option value="">All Transaction Types</option>
                <option value="PURCHASE">Purchase Intake</option>
                <option value="MANUFACTURING_ISSUE">Manufacturing Issue</option>
                <option value="MANUFACTURING_RECEIPT">Manufacturing Receipt</option>
                <option value="SALE">Distribution / Sale</option>
                <option value="REJECTION">Material Rejection</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="card shadow-sm border-0 overflow-hidden rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle my-0 bg-white">
              <thead className="bg-light border-bottom">
                <tr className="text-muted small text-uppercase tracking-wider">
                  <th className="ps-4 py-3 fw-semibold">Date</th>
                  <th className="py-3 fw-semibold">Product</th>
                  <th className="py-3 fw-semibold text-center">Quantity</th>
                  <th className="py-3 fw-semibold text-center">Type</th>
                  <th className="text-end pe-4 py-3 fw-semibold">Reference ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-5"><Loader2 size={32} className="animate-spin mx-auto text-primary opacity-30" /></td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-5 text-muted fst-italic">No ledger entries match your filter.</td></tr>
                ) : entries.map((e) => (
                  <tr key={e.id}>
                    <td className="ps-4 py-3 text-muted small whitespace-nowrap">{formatDate(e.created_at)}</td>
                    <td className="py-3"><span className="font-monospace fw-bold text-dark">{e.product?.name || "—"}</span></td>
                    <td className="py-3 text-center">
                      <span className={`badge px-3 py-2 fs-6 shadow-sm border ${e.quantity > 0 ? "bg-success bg-opacity-10 text-success border-success border-opacity-25" : e.quantity < 0 ? "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25" : "bg-light text-muted border-light"}`}>
                        {e.quantity > 0 ? "+" : ""}{e.quantity}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge bg-light text-secondary border fw-medium px-3 py-2">
                        {e.transaction_type || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="text-end pe-4 py-3">
                      <span className="font-monospace small fw-bold text-muted bg-light px-3 py-2 rounded shadow-sm border">
                        {e.reference_id || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
