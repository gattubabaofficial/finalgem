"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Loader2, AlertCircle, AlignJustify } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";
import Link from "next/link";

type LinesEntry = {
  id: string;
  entryNo: string;
  date: string;
  itemName: string;
  supplier: string;
  noOfLines: number | null;
  bunch: number;
  sublots?: any[];
};

const EMPTY_SUBLOT = {
  selectionLines: "",
  selectionLengthInch: "",
  selectionLengthMm: "",
  selectionLengthCm: "",
  rejectionLines: "",
  rejectionLengthInch: "",
  rejectionLengthMm: "",
  rejectionLengthCm: "",
};

const INITIAL_FORM = {
  entryNo: "",
  date: new Date().toISOString().slice(0, 10),
  itemName: "",
  supplier: "",
  descriptionRef: "",
  // Master lines fields
  noOfLines: "",
  lineLengthInch: "",
  lineLengthMm: "",
  lineLengthCm: "",
  // Master selection
  selectionLines: "",
  selectionLengthInch: "",
  selectionLengthMm: "",
  selectionLengthCm: "",
  // Master rejection
  rejectionLines: "",
  rejectionLengthInch: "",
  rejectionLengthMm: "",
  rejectionLengthCm: "",
  // Bunch
  bunch: "0",
};

export default function LinesEntryPage() {
  const [entries, setEntries] = useState<LinesEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [sublotForm, setSublotForm] = useState(EMPTY_SUBLOT);

  const bunch = parseInt(form.bunch || "0") || 0;

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`/api/lines-entry?search=${encodeURIComponent(search)}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (r.ok) {
        const data = await r.json();
        setEntries(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error("Error fetching lines entries:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Auto-calculate rejection = total - selection (lines)
  const f = (k: string, v: string) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "selectionLines" || k === "noOfLines") {
        const nl = parseInt(next.noOfLines || "0");
        const sl = parseInt(next.selectionLines || "0");
        if (sl <= nl) {
          next.rejectionLines = (nl - sl).toString();
          setError("");
        } else {
          setError(`Selection lines (${sl}) exceeds total lines (${nl})`);
        }
      }
      return next;
    });
  };

  const sf = (k: string, v: string) => {
    setSublotForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "selectionLines") {
        // Auto-calculate rejection based on master total lines
        const nl = parseInt(form.noOfLines || "0");
        const sl = parseInt(v || "0");
        if (sl <= nl) {
          next.rejectionLines = (nl - sl).toString();
        }
      }
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload: any = {
      ...form,
      bunch: parseInt(form.bunch || "0") || 0,
    };

    if (bunch === 1) {
      payload.sublot = sublotForm;
    }

    const r = await fetch("/api/lines-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (r.ok) {
      handleCloseModal();
      fetchEntries();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to save lines entry");
    }
    setSaving(false);
  }

  const handleCloseModal = () => {
    setShowForm(false);
    setForm(INITIAL_FORM);
    setSublotForm(EMPTY_SUBLOT);
    setError("");
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white">Lines Entry</h1>
          <p className="text-white text-opacity-75 text-sm mt-1">{total} total records</p>
        </div>
        <div className="col-auto ms-auto text-end mt-n1">
          <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-sm">
            <Plus className="w-4 h-4 me-1 align-middle d-inline-block" /> New Entry
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-3">
        <div className="card-body p-3">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text"><Search className="w-4 h-4" /></span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entry no, supplier, item..."
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card flex-fill w-100">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Entry No</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Item</th>
                <th className="text-center">Bunch</th>
                <th className="text-end">No. of Lines</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5 text-muted">No lines entries yet.</td></tr>
              ) : entries.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link href={`/lines-entry/${e.id}`} className="text-decoration-none font-monospace fw-bold text-primary">
                      {e.entryNo || "N/A"}
                    </Link>
                  </td>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.supplier || "—"}</td>
                  <td>{e.itemName || "—"}</td>
                  <td className="text-center">
                    <span className={`badge ${e.bunch === 1 ? "bg-success" : "bg-secondary"}`}>
                      {e.bunch === 1 ? "1 Sublot" : "None"}
                    </span>
                  </td>
                  <td className="text-end">{e.noOfLines ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <ModalPortal>
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: "40px", width: "92%", maxWidth: "800px" }}>
              <div className="modal-content border-0 shadow text-sm">
                <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                  <h5 className="modal-title fw-bold m-0" style={{ fontSize: "1.1rem" }}>
                    <AlignJustify className="w-4 h-4 me-2 d-inline-block align-middle" />
                    New Lines Entry
                  </h5>
                  <button type="button" className="btn-close m-0" style={{ fontSize: "0.75rem", opacity: 0.6 }} onClick={handleCloseModal} aria-label="Close" />
                </div>
                <div className="modal-body pb-4">
                  <form id="linesEntryForm" onSubmit={handleSubmit}>
                    {error && (
                      <div className="alert alert-danger p-2 text-sm d-flex align-items-center mb-3">
                        <AlertCircle className="w-4 h-4 me-2" /> {error}
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="row g-3 mb-3">
                      <Field label="Entry No *" className="col-md-6">
                        <input required value={form.entryNo} onChange={(e) => f("entryNo", e.target.value)} placeholder="e.g. LE-001" className="form-control" />
                      </Field>
                      <Field label="Date *" className="col-md-6">
                        <input required type="date" value={form.date} onChange={(e) => f("date", e.target.value)} className="form-control" />
                      </Field>
                      <Field label="Item Name" className="col-md-6">
                        <input value={form.itemName} onChange={(e) => f("itemName", e.target.value)} placeholder="e.g. Gold Chain" className="form-control" />
                      </Field>
                      <Field label="Supplier" className="col-md-6">
                        <input value={form.supplier} onChange={(e) => f("supplier", e.target.value)} placeholder="Supplier name" className="form-control" />
                      </Field>
                      <Field label="Description / Reference" className="col-md-12">
                        <input value={form.descriptionRef} onChange={(e) => f("descriptionRef", e.target.value)} placeholder="Notes..." className="form-control" />
                      </Field>
                    </div>

                    {/* Bunch */}
                    <div className="mt-3 pt-3 border-top mb-4">
                      <p className="small fw-bold text-muted text-uppercase mb-3">Bunch Configuration</p>
                      <div className="row g-3 align-items-center">
                        <Field label="Bunch (0 = No Sublot, 1 = One Sublot)" className="col-md-6">
                          <select value={form.bunch} onChange={(e) => f("bunch", e.target.value)} className="form-select">
                            <option value="0">0 — No Sublot</option>
                            <option value="1">1 — With Sublot</option>
                          </select>
                        </Field>
                        {bunch === 1 && (
                          <div className="col-md-6 d-flex align-items-end">
                            <div className="alert alert-info py-2 px-3 mb-0 w-100 small">
                              <strong>1 sublot</strong> will be created with received selection and rejection details.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Master Lines Details */}
                    <div className="pt-3 border-top">
                      <p className="small fw-bold text-muted text-uppercase mb-3">Lines Details (Master)</p>
                      <div className="row g-3 mb-3">
                        <Field label="No. of Lines" className="col-md-3">
                          <input type="number" value={form.noOfLines} onChange={(e) => f("noOfLines", e.target.value)} placeholder="0" className="form-control" />
                        </Field>
                        <Field label="Line Length (inch)" className="col-md-3">
                          <input type="number" step="0.001" value={form.lineLengthInch} onChange={(e) => f("lineLengthInch", e.target.value)} placeholder="0.000" className="form-control" />
                        </Field>
                        <Field label="Line Length (mm)" className="col-md-3">
                          <input type="number" step="0.001" value={form.lineLengthMm} onChange={(e) => f("lineLengthMm", e.target.value)} placeholder="0.000" className="form-control" />
                        </Field>
                        <Field label="Line Length (cm)" className="col-md-3">
                          <input type="number" step="0.001" value={form.lineLengthCm} onChange={(e) => f("lineLengthCm", e.target.value)} placeholder="0.000" className="form-control" />
                        </Field>
                      </div>
                    </div>

                    {/* Master Selection & Rejection */}
                    <div className="row mt-4">
                      <div className="col-md-6 border-top pt-3">
                        <p className="small fw-bold text-success text-uppercase mb-3">Selection</p>
                        <div className="row g-3">
                          <Field
                            label="No. of Lines"
                            className="col-12"
                            error={
                              parseInt(form.selectionLines || "0") > parseInt(form.noOfLines || "0")
                                ? "Exceeds total lines"
                                : ""
                            }
                          >
                            <input
                              type="number"
                              value={form.selectionLines}
                              onChange={(e) => f("selectionLines", e.target.value)}
                              placeholder="0"
                              className={`form-control ${parseInt(form.selectionLines || "0") > parseInt(form.noOfLines || "0") ? "is-invalid" : ""}`}
                            />
                          </Field>
                          <Field label="Length (inch)" className="col-md-4">
                            <input type="number" step="0.001" value={form.selectionLengthInch} onChange={(e) => f("selectionLengthInch", e.target.value)} placeholder="0.000" className="form-control" />
                          </Field>
                          <Field label="Length (mm)" className="col-md-4">
                            <input type="number" step="0.001" value={form.selectionLengthMm} onChange={(e) => f("selectionLengthMm", e.target.value)} placeholder="0.000" className="form-control" />
                          </Field>
                          <Field label="Length (cm)" className="col-md-4">
                            <input type="number" step="0.001" value={form.selectionLengthCm} onChange={(e) => f("selectionLengthCm", e.target.value)} placeholder="0.000" className="form-control" />
                          </Field>
                        </div>
                      </div>

                      <div className="col-md-6 border-top pt-3">
                        <p className="small fw-bold text-danger text-uppercase mb-3">Rejection</p>
                        <div className="row g-3">
                          <Field label="No. of Lines" className="col-12">
                            <input type="number" value={form.rejectionLines} onChange={(e) => f("rejectionLines", e.target.value)} placeholder="0" className="form-control" />
                          </Field>
                          <Field label="Length (inch)" className="col-md-4">
                            <input type="number" step="0.001" value={form.rejectionLengthInch} onChange={(e) => f("rejectionLengthInch", e.target.value)} placeholder="0.000" className="form-control" />
                          </Field>
                          <Field label="Length (mm)" className="col-md-4">
                            <input type="number" step="0.001" value={form.rejectionLengthMm} onChange={(e) => f("rejectionLengthMm", e.target.value)} placeholder="0.000" className="form-control" />
                          </Field>
                          <Field label="Length (cm)" className="col-md-4">
                            <input type="number" step="0.001" value={form.rejectionLengthCm} onChange={(e) => f("rejectionLengthCm", e.target.value)} placeholder="0.000" className="form-control" />
                          </Field>
                        </div>
                      </div>
                    </div>

                    {/* Sublot Section (only when bunch = 1) */}
                    {bunch === 1 && (
                      <div className="mt-4 pt-3 border-top">
                        <p className="small fw-bold text-primary text-uppercase mb-1">Sublot Entry</p>
                        <p className="text-muted small mb-3">Received selection and rejection for the sublot</p>
                        <div className="p-3 bg-light rounded">
                          <div className="row">
                            <div className="col-md-6 border-end pe-4">
                              <p className="small fw-bold text-success text-uppercase mb-3">Received — Selection</p>
                              <div className="row g-3">
                                <Field label="No. of Lines" className="col-12">
                                  <input type="number" value={sublotForm.selectionLines} onChange={(e) => sf("selectionLines", e.target.value)} placeholder="0" className="form-control" />
                                </Field>
                                <Field label="Length (inch)" className="col-md-4">
                                  <input type="number" step="0.001" value={sublotForm.selectionLengthInch} onChange={(e) => sf("selectionLengthInch", e.target.value)} placeholder="0.000" className="form-control" />
                                </Field>
                                <Field label="Length (mm)" className="col-md-4">
                                  <input type="number" step="0.001" value={sublotForm.selectionLengthMm} onChange={(e) => sf("selectionLengthMm", e.target.value)} placeholder="0.000" className="form-control" />
                                </Field>
                                <Field label="Length (cm)" className="col-md-4">
                                  <input type="number" step="0.001" value={sublotForm.selectionLengthCm} onChange={(e) => sf("selectionLengthCm", e.target.value)} placeholder="0.000" className="form-control" />
                                </Field>
                              </div>
                            </div>
                            <div className="col-md-6 ps-4">
                              <p className="small fw-bold text-danger text-uppercase mb-3">Received — Rejection</p>
                              <div className="row g-3">
                                <Field label="No. of Lines" className="col-12">
                                  <input type="number" value={sublotForm.rejectionLines} onChange={(e) => sf("rejectionLines", e.target.value)} placeholder="0" className="form-control" />
                                </Field>
                                <Field label="Length (inch)" className="col-md-4">
                                  <input type="number" step="0.001" value={sublotForm.rejectionLengthInch} onChange={(e) => sf("rejectionLengthInch", e.target.value)} placeholder="0.000" className="form-control" />
                                </Field>
                                <Field label="Length (mm)" className="col-md-4">
                                  <input type="number" step="0.001" value={sublotForm.rejectionLengthMm} onChange={(e) => sf("rejectionLengthMm", e.target.value)} placeholder="0.000" className="form-control" />
                                </Field>
                                <Field label="Length (cm)" className="col-md-4">
                                  <input type="number" step="0.001" value={sublotForm.rejectionLengthCm} onChange={(e) => sf("rejectionLengthCm", e.target.value)} placeholder="0.000" className="form-control" />
                                </Field>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-end pt-4 border-top mt-4">
                      <button type="submit" form="linesEntryForm" disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? "Saving..." : bunch === 1 ? "Save Entry & Sublot" : "Save Entry"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

function Field({
  label, children, className = "", error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className="form-label mb-1">{label}</label>
      {children}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}
