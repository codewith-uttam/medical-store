import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Key, ShieldCheck, User, X, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '../AuthContext';

const ROLES = ['admin', 'staff', 'pharmacist', 'cashier'];

const emptyForm = { username: '', password: '', confirmPassword: '', role: 'staff' };

export default function UserManagement() {
  const { authHeaders, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode, obj = edit mode
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // user id to confirm delete

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'https://medical-store-jdol.vercel.app'}/api/users`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ── Open add modal ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError('');
    setShowPassword(false);
    setShowConfirm(false);
    setModalOpen(true);
  };

  /* ── Open edit modal ── */
  const openEdit = (u) => {
    setEditTarget(u);
    setForm({ username: u.username, password: '', confirmPassword: '', role: u.role });
    setFormError('');
    setShowPassword(false);
    setShowConfirm(false);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  /* ── Save (create or update) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.username.trim()) return setFormError('Username is required.');

    if (!editTarget && !form.password) return setFormError('Password is required for new users.');

    if (form.password && form.password !== form.confirmPassword)
      return setFormError('Passwords do not match.');

    if (form.password && form.password.length < 4)
      return setFormError('Password must be at least 4 characters.');

    setSaving(true);
    try {
      const body = { username: form.username.trim(), role: form.role };
      if (form.password) body.password = form.password;

      const url = editTarget
        ? `${import.meta.env.VITE_API_URL || 'https://medical-store-jdol.vercel.app'}/api/users/${editTarget.id}`
        : `${import.meta.env.VITE_API_URL || 'https://medical-store-jdol.vercel.app'}/api/users`;
      const method = editTarget ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { setFormError(data.error || 'Failed to save user.'); setSaving(false); return; }

      fetchUsers();
      closeModal();
    } catch {
      setFormError('Network error. Please try again.');
    }
    setSaving(false);
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://medical-store-jdol.vercel.app'}/api/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setDeleteConfirm(null);
    fetchUsers();
  };

  const roleBadgeColor = (role) => {
    if (role === 'admin') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
    if (role === 'pharmacist') return { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' };
    if (role === 'cashier') return { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' };
    return { bg: 'rgba(168,146,122,0.12)', color: '#a8927a', border: 'rgba(168,146,122,0.3)' };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} color="var(--accent-primary)" />
            User Management
          </h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Add, edit, or remove store users</p>
        </div>
        <button className="btn btn-primary" id="add-user-btn" onClick={openAdd}>
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel">
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px' }}>Loading users…</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => {
                  const rc = roleBadgeColor(u.role);
                  const isMe = u.username === currentUser?.username;
                  return (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-secondary)', width: '48px' }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(245,158,11,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <User size={18} color="var(--accent-primary)" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.username}</div>
                            {isMe && <div style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>● You</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                          display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}>
                          <ShieldCheck size={12} /> {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            id={`edit-user-${u.id}`}
                            title="Edit user"
                            onClick={() => openEdit(u)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '6px' }}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            id={`delete-user-${u.id}`}
                            title={users.length <= 1 ? 'Cannot delete last user' : 'Delete user'}
                            onClick={() => setDeleteConfirm(u.id)}
                            disabled={users.length <= 1}
                            style={{
                              background: 'transparent', border: 'none',
                              color: users.length <= 1 ? 'var(--text-secondary)' : 'var(--danger)',
                              cursor: users.length <= 1 ? 'not-allowed' : 'pointer', padding: '6px'
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {editTarget ? <><Key size={20} /> Edit User</> : <><Plus size={20} /> Add User</>}
              </h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formError && (
                  <div style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '14px' }}>
                    ⚠ {formError}
                  </div>
                )}

                {/* Username */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Username</label>
                  <input
                    id="user-form-username"
                    type="text"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="e.g. john_doe"
                    required
                    autoFocus
                  />
                </div>

                {/* Role */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Role</label>
                  <select
                    id="user-form-role"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>

                {/* Password */}
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>{editTarget ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="user-form-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder={editTarget ? 'Leave blank to keep unchanged' : 'Enter password'}
                      style={{ paddingRight: '44px' }}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password — only show if password typed */}
                {form.password && (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="user-form-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        placeholder="Re-enter password"
                        style={{ paddingRight: '44px' }}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeModal}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button id="user-form-save" type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving…' : editTarget ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={20} /> Delete User
              </h2>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>
                  {users.find(u => u.id === deleteConfirm)?.username}
                </strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDeleteConfirm(null)}
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button id="confirm-delete-user" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={16} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
