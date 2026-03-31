"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, X, AlertCircle, Shield, User, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  organization_id?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [requesterRole, setRequesterRole] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<{id: string, name: string}[]>([]);
  const [form, setForm] = useState({ id: "", name: "", email: "", password: "", role: "STAFF", organization_id: "" });

  const fetchUsers = async () => {
    setLoading(true);
    const r = await fetch("/api/users");
    const data = await r.json();
    setUsers(data.users || []);
    setRequesterRole(data.requesterRole || null);
    setOrganizations(data.organizations || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    
    const isEditing = !!form.id;
    const r = await fetch("/api/users", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      setForm({ id: "", name: "", email: "", password: "", role: "STAFF", organization_id: "" });
      fetchUsers();
    } else {
      const d = await r.json();
      setError(d.error || `Failed to ${isEditing ? "update" : "create"} user`);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    const r = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    setSaving(false);
    if (r.ok) {
      setShowDeleteConfirm(null);
      fetchUsers();
    } else {
      const d = await r.json();
      alert(d.error || "Failed to delete user");
    }
  }

  const f = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const openEditModal = (u: UserRecord) => {
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      password: "", // Don't pre-fill password
      role: u.role,
      organization_id: u.organization_id || ""
    });
    setError("");
    setShowForm(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="gem-page-header">
        <div>
          <h1><Users size={20} /> User Management</h1>
          <p>Admin only — manage system users and roles</p>
        </div>
        <div>
          <button onClick={() => { setForm({ id: "", name: "", email: "", password: "", role: "STAFF", organization_id: "" }); setShowForm(true); }} className="btn btn-primary">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="card flex-fill w-100 mb-3">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="fw-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${
                      u.role === "SUPERADMIN" ? "bg-primary text-white" :
                      u.role === "ADMIN" ? "bg-warning text-dark border border-warning" : "bg-info text-dark border border-info"
                    }`}>
                      {u.role === "ADMIN" || u.role === "SUPERADMIN" ? <Shield className="w-3 h-3 me-1 d-inline" /> : <User className="w-3 h-3 me-1 d-inline" />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.isActive ? "bg-success" : "bg-danger"
                    }`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-muted small">{formatDate(u.createdAt)}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button onClick={() => openEditModal(u)} className="btn btn-sm btn-outline-primary p-1" title="Edit User">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(u.id)} className="btn btn-sm btn-outline-danger p-1" title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ModalPortal>
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: '100px', width: '92%', maxWidth: '500px' }}>
            <form onSubmit={handleSubmit} className="modal-content border-0 shadow">
              <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                <h5 className="modal-title fw-bold m-0">{form.id ? "Edit User" : "Add New User"}</h5>
                <button type="button" className="btn-close m-0" style={{ fontSize: '0.8rem', opacity: 0.6 }} onClick={() => setShowForm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger p-2 text-sm d-flex align-items-center"><AlertCircle className="w-4 h-4 me-2" />{error}</div>}
                <div className="mb-3">
                  <label className="form-label mb-1">Full Name *</label>
                  <input required value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="John Doe" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label mb-1">Email *</label>
                  <input required type="email" value={form.email} disabled={!!form.id} onChange={(e) => f("email", e.target.value)} placeholder="john@example.com" className="form-control bg-light" />
                  {form.id && <div className="form-text small">Email cannot be changed.</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label mb-1">Password {form.id ? "(Leave blank to keep current)" : "*"}</label>
                  <input required={!form.id} type="password" minLength={6} value={form.password} onChange={(e) => f("password", e.target.value)} placeholder={form.id ? "New password (optional)" : "Min 6 characters"} className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label mb-1">Role *</label>
                  <select value={form.role} onChange={(e) => f("role", e.target.value)} className="form-select">
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                    {requesterRole === "SUPERADMIN" && <option value="SUPERADMIN">Super Admin</option>}
                  </select>
                </div>
                {requesterRole === "SUPERADMIN" && (
                  <div>
                    <label className="form-label mb-1">Organization *</label>
                    <select 
                      required 
                      value={form.organization_id} 
                      onChange={(e) => f("organization_id", e.target.value)} 
                      className="form-select"
                    >
                      <option value="">Select Organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? (form.id ? "Updating..." : "Creating...") : (form.id ? "Update User" : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {showDeleteConfirm && (
        <ModalPortal>
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog mx-auto" style={{ marginTop: '150px', maxWidth: '400px' }}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-danger">Delete User?</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(null)}></button>
                </div>
                <div className="modal-body py-3">
                  <p className="mb-0">Are you sure you want to delete this user? This action cannot be undone.</p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                  <button type="button" className="btn btn-danger" disabled={saving} onClick={() => handleDelete(showDeleteConfirm)}>
                    {saving ? "Deleting..." : "Delete User"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
