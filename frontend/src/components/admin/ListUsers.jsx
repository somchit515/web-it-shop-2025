import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData';
import AdminLayout from '../layout/AdminLayout';
import { useGetAdminUsersQuery, useDeleteUserMutation } from '../redux/api/userApi';
import { confirmDialog } from './_shared/confirmDialog';
import Breadcrumb from './_shared/Breadcrumb';
import useBulkSelect from './_shared/useBulkSelect';
import { exportToCSV } from './_shared/exportCSV';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('lo-LA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AVATAR_FALLBACK = 'https://cdn-icons-png.flaticon.com/512/3607/3607444.png';

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
.lu-wrap { padding: 28px 28px 40px; background: #f0f2f5; min-height: 100%; box-sizing: border-box; }

/* ── Hero header ── */
.lu-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 28px 32px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(102,126,234,.35);
  flex-wrap: wrap;
}
.lu-hero-title { font-size: 22px; font-weight: 700; margin: 6px 0 4px; letter-spacing: -.3px; }
.lu-hero-sub { font-size: 13px; opacity: .75; margin: 0; }
.lu-breadcrumb-override { opacity: .7; }

/* ── Stat cards ── */
.lu-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}
.lu-stat {
  background: #fff;
  border-radius: 18px;
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  transition: transform .2s, box-shadow .2s;
  cursor: default;
}
.lu-stat:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.10); }
.lu-stat-icon {
  width: 50px; height: 50px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.lu-stat-label { font-size: 12px; color: #9ca3af; font-weight: 600; margin-bottom: 2px; text-transform: uppercase; letter-spacing: .5px; }
.lu-stat-value { font-size: 28px; font-weight: 800; color: #1e293b; line-height: 1; }

/* ── Filter bar ── */
.lu-filters {
  background: #fff;
  border-radius: 16px;
  padding: 18px 22px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.lu-search-wrap { position: relative; flex: 1; min-width: 200px; }
.lu-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 13px; pointer-events: none; }
.lu-search {
  width: 100%; padding: 10px 14px 10px 38px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px; color: #374151;
  outline: none; background: #f9fafb;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
.lu-search:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.12); background: #fff; }
.lu-select {
  padding: 10px 36px 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px; color: #374151;
  outline: none; appearance: none;
  background: #f9fafb url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 12px center;
  cursor: pointer;
  transition: border-color .2s;
  min-width: 140px;
}
.lu-select:focus { border-color: #667eea; background-color: #fff; outline: none; }
.lu-count-text { font-size: 12px; color: #9ca3af; margin-left: auto; white-space: nowrap; }
.lu-count-text b { color: #374151; }

/* ── Bulk bar ── */
.lu-bulk-bar {
  background: rgba(102,126,234,.08);
  border: 1.5px solid rgba(102,126,234,.3);
  border-radius: 14px;
  padding: 12px 20px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}
.lu-bulk-info { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #667eea; }
.lu-bulk-actions { display: flex; align-items: center; gap: 8px; }

/* ── Buttons ── */
.lu-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  border-radius: 11px;
  font-size: 13px; font-weight: 600;
  border: none; cursor: pointer;
  transition: all .15s; white-space: nowrap;
}
.lu-btn-white { background: rgba(255,255,255,.2); color: #fff; border: 1.5px solid rgba(255,255,255,.4); backdrop-filter: blur(4px); }
.lu-btn-white:hover { background: rgba(255,255,255,.35); }
.lu-btn-ghost { background: transparent; color: #667eea; padding: 8px 14px; font-size: 13px; }
.lu-btn-ghost:hover { background: rgba(102,126,234,.08); }
.lu-btn-danger { background: #ef4444; color: #fff; }
.lu-btn-danger:hover { background: #dc2626; }
.lu-btn-clear { background: #fff0f0; color: #ef4444; border: 1.5px solid #fecaca; }
.lu-btn-clear:hover { background: #fee2e2; }

/* ── Table card ── */
.lu-table-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  overflow: hidden;
}

/* ── Table ── */
.lu-table { width: 100%; border-collapse: collapse; }
.lu-table thead { position: sticky; top: 0; z-index: 1; }
.lu-table thead th {
  background: #f8f9fb;
  padding: 13px 16px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .8px;
  color: #94a3b8;
  border-bottom: 1px solid #edf0f4;
  white-space: nowrap;
}
.lu-table thead th:first-child { border-radius: 0; }
.lu-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background .12s; }
.lu-table tbody tr:last-child { border-bottom: none; }
.lu-table tbody tr:hover { background: #fafbff; }
.lu-table tbody tr.lu-selected { background: rgba(102,126,234,.06); }
.lu-table td { padding: 13px 16px; vertical-align: middle; }

/* ── Avatar ── */
.lu-avatar {
  width: 40px; height: 40px;
  border-radius: 50%; object-fit: cover;
  border: 2.5px solid #f0f2f5;
  flex-shrink: 0;
  transition: transform .2s;
}
.lu-table tr:hover .lu-avatar { transform: scale(1.08); }
.lu-user-cell { display: flex; align-items: center; gap: 12px; }
.lu-user-name { font-size: 14px; font-weight: 600; color: #1e293b; white-space: nowrap; }
.lu-user-email { font-size: 12px; color: #94a3b8; margin-top: 1px; }

/* ── Role badges ── */
.lu-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
  white-space: nowrap; letter-spacing: .2px;
}
.lu-badge-superadmin { background: linear-gradient(135deg,#fef9c3,#fde68a); color: #92400e; border: 1px solid #fde68a; }
.lu-badge-admin { background: linear-gradient(135deg,#ede9fe,#ddd6fe); color: #5b21b6; border: 1px solid #ddd6fe; }
.lu-badge-user { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

/* ── ID chip ── */
.lu-id {
  font-family: 'Courier New', monospace; font-size: 11px;
  color: #94a3b8; background: #f8fafc;
  padding: 3px 8px; border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* ── Action buttons ── */
.lu-act {
  width: 34px; height: 34px;
  border-radius: 10px; border: 1.5px solid transparent;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; cursor: pointer;
  transition: all .15s; text-decoration: none;
}
.lu-act-edit { background: #f3f0ff; color: #7c3aed; border-color: #ede9fe; }
.lu-act-edit:hover { background: #7c3aed; color: #fff; border-color: #7c3aed; }
.lu-act-del { background: #fff5f5; color: #ef4444; border-color: #fee2e2; }
.lu-act-del:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
.lu-act:disabled { opacity: .4; cursor: not-allowed; pointer-events: none; }

/* ── Checkbox ── */
.lu-checkbox { width: 16px; height: 16px; accent-color: #667eea; cursor: pointer; border-radius: 4px; }

/* ── Empty state ── */
.lu-empty { padding: 80px 20px; text-align: center; }
.lu-empty-icon { font-size: 52px; color: #e2e8f0; margin-bottom: 16px; }
.lu-empty-text { font-size: 15px; color: #9ca3af; font-weight: 500; margin: 0; }
.lu-empty-sub { font-size: 13px; color: #c4ccd5; margin-top: 6px; }

/* ── Date ── */
.lu-date { font-size: 12px; color: #94a3b8; white-space: nowrap; }

/* ── Footer ── */
.lu-footer { text-align: center; padding: 16px; font-size: 12px; color: #c4ccd5; }

/* ── Responsive ── */
@media (max-width: 1100px) { .lu-stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 680px) {
  .lu-wrap { padding: 16px; }
  .lu-hero { padding: 20px; }
  .lu-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .lu-table thead th:nth-child(5),
  .lu-table td:nth-child(5),
  .lu-table thead th:nth-child(6),
  .lu-table td:nth-child(6) { display: none; }
}
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg, fg }) {
  return (
    <div className="lu-stat">
      <div className="lu-stat-icon" style={{ background: bg, color: fg }}>
        <i className={icon} />
      </div>
      <div>
        <div className="lu-stat-label">{label}</div>
        <div className="lu-stat-value">{value}</div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  if (role === 'superAdmin')
    return <span className="lu-badge lu-badge-superadmin"><i className="fas fa-crown" /> Super Admin</span>;
  if (role === 'admin')
    return <span className="lu-badge lu-badge-admin"><i className="fas fa-shield-alt" /> Admin</span>;
  return <span className="lu-badge lu-badge-user"><i className="fas fa-user" /> User</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ListUsers() {
  const { data, isLoading, error, isError, refetch } = useGetAdminUsersQuery();
  const [deleteUser, { isLoading: isDeleteLoading, error: deleteError, isSuccess: isDeleteSuccess }] =
    useDeleteUserMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const users = data?.users || [];

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || [u.name, u.email, u._id].some((v) => (v || '').toLowerCase().includes(q));
      const matchRole = !roleFilter || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  const bulk = useBulkSelect(filteredUsers, (u) => u._id);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const superAdmins = users.filter((u) => u.role === 'superAdmin').length;
    return { total, admins, superAdmins, regular: total - admins - superAdmins };
  }, [users]);

  const roles = useMemo(
    () => [...new Set(users.map((u) => u.role).filter(Boolean))].sort(),
    [users]
  );

  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = bulk.isPartial;
  }, [bulk.isPartial]);

  useEffect(() => {
    if (isError) toast.error(error?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
  }, [isError, error]);

  useEffect(() => {
    if (deleteError) { toast.error(deleteError?.data?.message || 'ການລຶບລົ້ມເຫຼວ'); setDeletingId(null); }
    if (isDeleteSuccess) { toast.success('ລຶບຜູ້ໃຊ້ສຳເລັດ'); refetch(); setDeletingId(null); }
  }, [isDeleteSuccess, deleteError, refetch]);

  const handleDelete = useCallback(async (id, name) => {
    const ok = await confirmDialog.show({
      title: 'ລຶບຜູ້ໃຊ້?',
      message: `ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບ "${name}" — ຂໍ້ມູນຈະຫາຍຖາວອນ`,
      confirmText: 'ລຶບເລີຍ',
      variant: 'danger',
    });
    if (!ok) return;
    setDeletingId(id);
    deleteUser(id);
  }, [deleteUser]);

  const handleBulkDelete = useCallback(async () => {
    const ids = bulk.selectedIds;
    if (!ids.length) return;
    const ok = await confirmDialog.show({
      title: `ລຶບ ${ids.length} ຜູ້ໃຊ້?`,
      message: 'ຜູ້ໃຊ້ທີ່ເລືອກຈະຖືກລຶບຖາວອນ',
      confirmText: `ລຶບທັງໝົດ (${ids.length})`,
      variant: 'danger',
    });
    if (!ok) return;
    const results = await Promise.allSettled(ids.map((id) => deleteUser(id).unwrap()));
    const failed = results.filter((r) => r.status === 'rejected').length;
    const ok2 = results.length - failed;
    if (ok2 > 0) toast.success(`ລຶບສຳເລັດ ${ok2} ລາຍການ`);
    if (failed > 0) toast.error(`ລຶບລົ້ມເຫຼວ ${failed} ລາຍການ`);
    bulk.clear();
    refetch();
  }, [bulk, deleteUser, refetch]);

  const handleExport = useCallback(() => {
    exportToCSV({
      filename: 'users',
      columns: [
        { key: '_id',       label: 'ID' },
        { key: 'name',      label: 'ຊື່' },
        { key: 'email',     label: 'ອີເມວ' },
        { key: 'role',      label: 'Role' },
        { key: 'createdAt', label: 'ສະມາຊິກຕັ້ງແຕ່', format: formatDate },
      ],
      rows: filteredUsers,
    });
  }, [filteredUsers]);

  const clearFilters = () => { setSearchTerm(''); setRoleFilter(''); };
  const hasFilters = searchTerm !== '' || roleFilter !== '';

  if (isLoading) return <Loader />;

  return (
    <>
      <style>{CSS}</style>
      <MetaData title="ຈັດການຜູ້ໃຊ້ — Admin" />
      <AdminLayout>
        <div className="lu-wrap">

          {/* ── Hero Header ── */}
          <div className="lu-hero">
            <div>
              <div className="lu-breadcrumb-override">
                <Breadcrumb items={[{ label: 'ຈັດການຜູ້ໃຊ້' }]} />
              </div>
              <h1 className="lu-hero-title">
                <i className="fas fa-users me-2" />
                ຈັດການຜູ້ໃຊ້
              </h1>
              <p className="lu-hero-sub">
                {users.length} ຜູ້ໃຊ້ທັງໝົດໃນລະບົບ
              </p>
            </div>
            <button className="lu-btn lu-btn-white" onClick={handleExport}>
              <i className="fas fa-download" />
              Export CSV
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="lu-stats">
            <StatCard icon="fas fa-users"      label="ທັງໝົດ"       value={stats.total}       bg="#eff6ff" fg="#3b82f6" />
            <StatCard icon="fas fa-user"       label="ຜູ້ໃຊ້ທົ່ວໄປ"  value={stats.regular}     bg="#f1f5f9" fg="#64748b" />
            <StatCard icon="fas fa-shield-alt" label="Admin"         value={stats.admins}      bg="#f5f3ff" fg="#7c3aed" />
            <StatCard icon="fas fa-crown"      label="Super Admin"   value={stats.superAdmins} bg="#fffbeb" fg="#d97706" />
          </div>

          {/* ── Filters ── */}
          <div className="lu-filters">
            {/* Search */}
            <div className="lu-search-wrap">
              <i className="fas fa-search lu-search-icon" />
              <input
                type="text"
                className="lu-search"
                placeholder="ຄົ້ນຫາ ຊື່, ອີເມວ, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role */}
            <select
              className="lu-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">ທຸກ Role</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <button className="lu-btn lu-btn-clear" onClick={clearFilters}>
                <i className="fas fa-times" />
                ລ້າງ
              </button>
            )}

            {/* Count */}
            <span className="lu-count-text">
              ສະແດງ <b>{filteredUsers.length}</b> / <b>{users.length}</b> ຄົນ
            </span>
          </div>

          {/* ── Bulk Bar ── */}
          {bulk.selectedCount > 0 && (
            <div className="lu-bulk-bar">
              <div className="lu-bulk-info">
                <i className="fas fa-check-square" />
                ເລືອກແລ້ວ {bulk.selectedCount} ລາຍການ
              </div>
              <div className="lu-bulk-actions">
                <button className="lu-btn lu-btn-ghost" onClick={bulk.clear}>
                  ຍົກເລີກ
                </button>
                <button className="lu-btn lu-btn-danger" onClick={handleBulkDelete}>
                  <i className="fas fa-trash" />
                  ລຶບ ({bulk.selectedCount})
                </button>
              </div>
            </div>
          )}

          {/* ── Table Card ── */}
          <div className="lu-table-card">
            {filteredUsers.length === 0 ? (
              <div className="lu-empty">
                <div className="lu-empty-icon"><i className="fas fa-users" /></div>
                <p className="lu-empty-text">ບໍ່ພົບຜູ້ໃຊ້</p>
                {hasFilters && (
                  <p className="lu-empty-sub">
                    <button
                      className="lu-btn lu-btn-ghost"
                      style={{ margin: '0 auto' }}
                      onClick={clearFilters}
                    >
                      ລ້າງຕົວກອງ
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="lu-table">
                  <thead>
                    <tr>
                      <th style={{ width: 44, textAlign: 'center' }}>
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          className="lu-checkbox"
                          checked={bulk.isAllSelected}
                          onChange={bulk.toggleAll}
                        />
                      </th>
                      <th>ຜູ້ໃຊ້</th>
                      <th>Role</th>
                      <th>ສະມາຊິກຕັ້ງແຕ່</th>
                      <th>ID</th>
                      <th style={{ textAlign: 'right' }}>ການດຳເນີນ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className={bulk.isSelected(user._id) ? 'lu-selected' : ''}
                      >
                        {/* Checkbox */}
                        <td style={{ textAlign: 'center', width: 44 }}>
                          <input
                            type="checkbox"
                            className="lu-checkbox"
                            checked={bulk.isSelected(user._id)}
                            onChange={() => bulk.toggle(user._id)}
                          />
                        </td>

                        {/* User */}
                        <td>
                          <div className="lu-user-cell">
                            <img
                              src={user?.avatar?.url || AVATAR_FALLBACK}
                              alt={user?.name || 'User'}
                              className="lu-avatar"
                              onError={(e) => { e.currentTarget.src = AVATAR_FALLBACK; }}
                            />
                            <div>
                              <div className="lu-user-name">{user?.name || 'N/A'}</div>
                              <div className="lu-user-email">{user?.email || '—'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td><RoleBadge role={user?.role} /></td>

                        {/* Date */}
                        <td><span className="lu-date">{formatDate(user?.createdAt)}</span></td>

                        {/* ID */}
                        <td>
                          <span className="lu-id" title={user?._id}>
                            #{(user?._id || '').substring(0, 8)}…
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            <Link
                              to={`/admin/users/${user._id}`}
                              className="lu-act lu-act-edit"
                              title="ແກ້ໄຂ"
                            >
                              <i className="fas fa-pen" />
                            </Link>
                            <button
                              className="lu-act lu-act-del"
                              title="ລຶບ"
                              onClick={() => handleDelete(user._id, user.name)}
                              disabled={deletingId === user._id || isDeleteLoading}
                            >
                              {deletingId === user._id
                                ? <i className="fas fa-spinner fa-spin" />
                                : <i className="fas fa-trash" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {filteredUsers.length > 0 && (
            <div className="lu-footer">
              ທັງໝົດ {filteredUsers.length} ຜູ້ໃຊ້
            </div>
          )}

        </div>
      </AdminLayout>
    </>
  );
}
