"use client";

import { useEffect, useState } from "react";
import {
  Gem, Package, ShoppingCart, TrendingUp, AlertTriangle,
  BookOpen, Loader2, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { formatINR, getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  IN_STOCK: "#2cd07e",
  IN_PROCESS: "#F6C000",
  READY: "#3b8aff",
  PARTIALLY_SOLD: "#725AF2",
  CLOSED: "#718096",
  RETURNED: "#43CED7",
  PENDING: "#f97316",
  CLOSED_RETURNED: "#F8285A",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard", { headers: { "Cache-Control": "no-cache" } })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--gem-primary)" }} />
      </div>
    );
  }

  const statusData = (stats?.subLotsByStatus || []).map((s: any) => ({
    name: getStatusLabel(s.status),
    value: s._count,
    color: STATUS_COLORS[s.status] || "#718096",
  }));

  const profit = (stats?.totalSaleValue || 0) - (stats?.totalPurchaseValue || 0);

  return (
    <div>
      {/* Page Header */}
      <div className="gem-page-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={22} style={{ color: "var(--gem-primary)" }} /> Inventory Dashboard
          </h1>
          <p>Live overview of your gem inventory</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row" style={{ marginBottom: 24 }}>
        <div className="col-6 col-xxl-3" style={{ marginBottom: 16 }}>
          <div className="gem-stat-card">
            <div className="gem-stat-card__header">
              <span className="gem-stat-card__title">Total Lots</span>
              <div className="gem-stat-card__icon" style={{ background: "linear-gradient(135deg, #5D5FEF, #7B61FF)", color: "#fff" }}>
                <Package size={20} />
              </div>
            </div>
            <div className="gem-stat-card__value">{stats?.totalLots || 0}</div>
          </div>
        </div>
        <div className="col-6 col-xxl-3" style={{ marginBottom: 16 }}>
          <div className="gem-stat-card">
            <div className="gem-stat-card__header">
              <span className="gem-stat-card__title">Sub-Lots</span>
              <div className="gem-stat-card__icon" style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", color: "#fff" }}>
                <Gem size={20} />
              </div>
            </div>
            <div className="gem-stat-card__value">{stats?.totalSubLots || 0}</div>
          </div>
        </div>
        <div className="col-6 col-xxl-3" style={{ marginBottom: 16 }}>
          <div className="gem-stat-card">
            <div className="gem-stat-card__header">
              <span className="gem-stat-card__title">Purchase Value</span>
              <div className="gem-stat-card__icon" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff" }}>
                <ShoppingCart size={20} />
              </div>
            </div>
            <div className="gem-stat-card__value">{formatINR(stats?.totalPurchaseValue || 0)}</div>
          </div>
        </div>
        <div className="col-6 col-xxl-3" style={{ marginBottom: 16 }}>
          <div className="gem-stat-card">
            <div className="gem-stat-card__header">
              <span className="gem-stat-card__title">Sales Value</span>
              <div className="gem-stat-card__icon" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#fff" }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="gem-stat-card__value">{formatINR(stats?.totalSaleValue || 0)}</div>
          </div>
        </div>
      </div>

      {/* Profit + Alerts Row */}
      <div className="row">
        <div className="col-12 col-lg-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ height: "100%" }}>
            <div className="card-body">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gem-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Net Profit / Loss</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: profit >= 0 ? "var(--gem-success)" : "var(--gem-error)", lineHeight: 1.2, marginBottom: 12 }}>
                {formatINR(profit)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: profit >= 0 ? "var(--gem-success)" : "var(--gem-error)" }}>
                {profit >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {profit >= 0 ? "Positive" : "Negative"} margin
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ height: "100%" }}>
            <div className="card-body">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gem-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Rejection Pending</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--gem-warning)", lineHeight: 1.2, marginBottom: 12 }}>
                {stats?.pendingRejections || 0}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--gem-warning)" }}>
                <AlertTriangle size={16} /> Requires attention
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ height: "100%" }}>
            <div className="card-body">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gem-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Total Transactions</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--gem-text)", lineHeight: 1.2, marginBottom: 12 }}>
                {(stats?.totalPurchases || 0) + (stats?.totalSales || 0)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--gem-text-secondary)" }}>
                <Activity size={16} /> {stats?.totalPurchases} purchases &middot; {stats?.totalSales} sales
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row">
        {/* Pie Chart */}
        <div className="col-12 col-md-6" style={{ marginBottom: 24 }}>
          <div className="card" style={{ height: "100%" }}>
            <div className="card-header">
              <h5 className="card-title">Stock by Status</h5>
            </div>
            <div className="card-body">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--gem-paper)",
                        border: "1px solid var(--gem-border)",
                        borderRadius: 8,
                        fontSize: 13,
                        boxShadow: "var(--gem-shadow)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", color: "var(--gem-text-secondary)", padding: 40 }}>No data yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="col-12 col-md-6" style={{ marginBottom: 24 }}>
          <div className="card" style={{ height: "100%" }}>
            <div className="card-header">
              <h5 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={16} /> Recent Ledger Activity
              </h5>
            </div>
            <div className="card-body" style={{ padding: "12px 20px" }}>
              {(stats?.recentLedger || []).length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--gem-text-secondary)", padding: 40 }}>No activity yet</div>
              ) : (
                (stats?.recentLedger || []).slice(0, 6).map((entry: any) => (
                  <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--gem-border)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{entry.lot?.lotNo || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--gem-text-secondary)" }}>
                        {entry.fromLocation} &rarr; {entry.toLocation}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.weight} {entry.weightUnit}</div>
                      <div style={{ fontSize: 12, color: "var(--gem-text-secondary)" }}>{formatDate(entry.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Stock Summary */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={16} /> Live Stock Summary
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Category / Status</th>
                    <th>Total Weight</th>
                    <th>Pieces</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.subLotsByStatus?.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "var(--gem-text-secondary)", padding: 32 }}>No stock data available</td>
                    </tr>
                  ) : (
                    stats?.subLotsByStatus?.map((s: any) => (
                      <tr key={s.status}>
                        <td>
                          <span
                            className="badge"
                            style={{ backgroundColor: STATUS_COLORS[s.status] || "#94a3b8", color: "#fff" }}
                          >
                            {getStatusLabel(s.status)}
                          </span>
                        </td>
                        <td><strong>{s._sum?.weight || 0}</strong> <span style={{ color: "var(--gem-text-secondary)", fontSize: 12, marginLeft: 4 }}>GM</span></td>
                        <td><strong>{s._sum?.pieces || 0}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
