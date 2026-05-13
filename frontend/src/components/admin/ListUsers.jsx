import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faPencilAlt, 
  faTrash, 
  faSpinner,
  faSearch,
  faUserShield,
  faUsers,
  faFilter,
  faSortAmountUp,
  faSortAmountDown
} from '@fortawesome/free-solid-svg-icons';

import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { MDBDataTable } from 'mdbreact';
import MetaData from '../layout/MetaData';
import AdminLayout from '../layout/AdminLayout';
import {
  useGetAdminUsersQuery,
  useDeleteUserMutation
} from '../redux/api/userApi';
import { confirmDialog } from './_shared/confirmDialog';
import Breadcrumb from './_shared/Breadcrumb';
import useBulkSelect from './_shared/useBulkSelect';
import BulkActionsBar from './_shared/BulkActionsBar';
import { exportToCSV } from './_shared/exportCSV';

function ListUsers() {
  const {
    data,
    isLoading,
    error,
    isError,
    refetch
  } = useGetAdminUsersQuery();

  const [
    deleteUser,
    { isLoading: isDeleteLoading, error: deleteError, isSuccess: isDeleteSuccess }
  ] = useDeleteUserMutation();

  const users = data?.users || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deletingId, setDeletingId] = useState(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const superAdmins = users.filter(u => u.role === 'superAdmin').length;
    const regularUsers = totalUsers - admins - superAdmins;

    return {
      totalUsers,
      admins,
      superAdmins,
      regularUsers
    };
  }, [users]);

  // Get unique roles
  const roles = useMemo(() => {
    const roleSet = [...new Set(users.map(u => u.role).filter(Boolean))];
    return roleSet.sort();
  }, [users]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້.");
    }
  }, [isError, error]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError?.data?.message || "ການລຶບລົ້ມເຫຼວ.");
      setDeletingId(null);
    }

    if (isDeleteSuccess) {
      toast.success("ລຶບຜູ້ໃຊ້ສຳເລັດແລ້ວ.");
      refetch();
      setDeletingId(null);
    }
  }, [isDeleteSuccess, deleteError, refetch]);

  const handleDelete = async (id, userName) => {
    const ok = await confirmDialog.show({
      title: 'ລຶບຜູ້ໃຊ້?',
      message: `ທ່ານແນ່ໃຈບໍ່ວ່າຈະລຶບ "${userName}"\nຂໍ້ມູນຈະຫາຍຖາວອນ`,
      confirmText: 'ລຶບເລີຍ',
      cancelText: 'ຍົກເລີກ',
      variant: 'danger',
      icon: 'fa-user-minus',
    });
    if (!ok) return;
    setDeletingId(id);
    deleteUser(id);
  };

  // ✅ Bulk select + bulk delete + export
  const filteredUsers = getFilteredUsers();
  const bulk = useBulkSelect(filteredUsers, (u) => u._id);

  const handleBulkDelete = async () => {
    const ids = bulk.selectedIds;
    if (ids.length === 0) return;
    const ok = await confirmDialog.show({
      title: `ລຶບ ${ids.length} ຜູ້ໃຊ້?`,
      message: 'ຜູ້ໃຊ້ທີ່ເລືອກຈະຖືກລຶບຖາວອນ',
      confirmText: `ລຶບທັງໝົດ (${ids.length})`,
      variant: 'danger',
      icon: 'fa-users-slash',
    });
    if (!ok) return;
    try {
      await Promise.all(ids.map((id) => deleteUser(id).unwrap()));
      toast.success(`ລຶບ ${ids.length} ຜູ້ໃຊ້ສຳເລັດ`);
      bulk.clear();
    } catch (err) {
      toast.error(err?.data?.message || 'ການລຶບບາງລາຍການລົ້ມເຫລວ');
    }
  };

  const handleExport = () => {
    exportToCSV({
      filename: 'users',
      columns: [
        { key: '_id', label: 'ID' },
        { key: 'name', label: 'ຊື່' },
        { key: 'email', label: 'ອີເມວ' },
        { key: 'role', label: 'Role' },
        { key: 'createdAt', label: 'ສະມາຊິກຕັ້ງແຕ່', format: (v) => v ? new Date(v).toLocaleDateString('lo-LA') : '' },
      ],
      rows: filteredUsers,
    });
  };

  const getFilteredUsers = () => {
    let filtered = users.filter(u => {
      const searchMatch = !searchTerm ||
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u._id || "").toLowerCase().includes(searchTerm.toLowerCase());

      const roleMatch = !roleFilter || u.role === roleFilter;

      return searchMatch && roleMatch;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "name":
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          break;
        case "email":
          aVal = (a.email || "").toLowerCase();
          bVal = (b.email || "").toLowerCase();
          break;
        case "role":
          aVal = (a.role || "").toLowerCase();
          bVal = (b.role || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // (filteredUsers ถูกประกาศไว้ด้านบนแล้วใน bulk select section)

  const clearAllFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'superAdmin':
        return <span className="badge badge-superadmin">Super Admin</span>;
      case 'admin':
        return <span className="badge badge-admin">Admin</span>;
      default:
        return <span className="badge badge-user">User</span>;
    }
  };

  const tableData = useMemo(() => {
    const dataTable = {
      columns: [
        {
          label: (
            <input
              type="checkbox"
              checked={bulk.isAllSelected}
              ref={(el) => { if (el) el.indeterminate = bulk.isPartial; }}
              onChange={bulk.toggleAll}
              aria-label="Select all"
            />
          ),
          field: 'select',
          sort: 'disabled',
          width: 40,
        },
        { label: 'ຜູ້ໃຊ້', field: 'user', sort: 'disabled', width: 300 },
        { label: 'ອີເມວ', field: 'email', sort: 'asc' },
        { label: 'Role', field: 'role', sort: 'asc' },
        { label: 'ID', field: 'id', sort: 'disabled' },
        { label: 'ການດຳເນີນ', field: 'actions', sort: 'disabled' },
      ],
      rows: [],
    };

    filteredUsers.forEach((user) => {
      dataTable.rows.push({
        select: (
          <input
            type="checkbox"
            checked={bulk.isSelected(user._id)}
            onChange={() => bulk.toggle(user._id)}
            aria-label={`เลือก ${user.name}`}
          />
        ),
        user: (
          <div className="d-flex align-items-center">
            <div className="user-avatar-wrapper me-3">
              <img
                src={user?.avatar?.url || "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"}
                alt={user?.name}
                className="user-avatar-img"
              />
            </div>
            <div>
              <div className="fw-semibold text-dark">{user?.name || 'N/A'}</div>
              <small className="text-muted">
                ສະມາຊິກຕັ້ງແຕ່: {new Date(user?.createdAt).toLocaleDateString('lo-LA')}
              </small>
            </div>
          </div>
        ),
        email: <div className="text-muted">{user?.email || 'N/A'}</div>,
        role: getRoleBadge(user?.role),
        id: <small className="text-muted">#{user?._id.substring(0, 8)}...</small>,
        actions: (
          <div className="btn-group" role="group">
            <Link
              to={`/admin/users/${user?._id}`}
              className="btn btn-outline-primary btn-sm"
              title="ແກ້ໄຂ"
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </Link>

            <button
              onClick={() => handleDelete(user._id, user.name)}
              className="btn btn-outline-danger btn-sm"
              disabled={deletingId === user._id}
              title="ລຶບ"
            >
              {deletingId === user._id ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
            </button>
          </div>
        ),
      });
    });

    return dataTable;
  }, [filteredUsers, deletingId, bulk]);

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title="ຈັດການຜູ້ໃຊ້ - Admin" />
      <style>{`
        /* Modern styling for List Users */
        .list-users-container {
          padding: 0;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .breadcrumb-nav a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-nav a:hover {
          color: #764ba2;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-title svg {
          color: #667eea;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .stat-card.primary::before {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .stat-card.admin::before {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card.superadmin::before {
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }

        .stat-card.user::before {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-info h6 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-info h4 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          opacity: 0.2;
        }

        /* Filter Section */
        .filter-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filter-field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-control, .form-select {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: white;
        }

        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          outline: none;
        }

        .sort-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-sort {
          flex: 1;
          padding: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-sort.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .btn-sort:hover:not(.active) {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-clear {
          padding: 8px 16px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-clear:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        /* Table Section */
        .table-section {
          background: white;
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        table.dataTable thead th {
          background-color: #f8fafc;
          color: #1e293b;
          font-weight: 700;
          border-bottom: 2px solid #e2e8f0;
          padding: 1rem;
        }

        table.dataTable tbody td {
          vertical-align: middle;
          padding: 1rem;
        }

        .user-avatar-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #e2e8f0;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Role Badges */
        .badge {
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .badge-superadmin {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .badge-admin {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .badge-user {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-group {
          display: flex;
          gap: 4px;
        }

        .btn-group .btn-sm {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state svg {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .empty-state h5 {
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 991.98px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 767.98px) {
          .page-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <AdminLayout>
        <div className="list-users-container">
          {/* Page Header */}
          <div className="page-header">
            <Breadcrumb items={[{ label: 'ຈັດການຜູ້ໃຊ້' }]} />
            <h1 className="page-title">
              <FontAwesomeIcon icon={faUsers} />
              ຈັດການຜູ້ໃຊ້
            </h1>
            <p className="page-subtitle">
              ຈັດການ, ແກ້ໄຂ, ແລະ ລຶບຜູ້ໃຊ້ໃນລະບົບ
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ທັງໝົດ</h6>
                  <h4 style={{ color: '#667eea' }}>{stats.totalUsers}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
            </div>

            <div className="stat-card admin">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>Admin</h6>
                  <h4 style={{ color: '#f59e0b' }}>{stats.admins}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
              </div>
            </div>

            <div className="stat-card superadmin">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>Super Admin</h6>
                  <h4 style={{ color: '#ef4444' }}>{stats.superAdmins}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
              </div>
            </div>

            <div className="stat-card user">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ຜູ້ໃຊ້ທົ່ວໄປ</h6>
                  <h4 style={{ color: '#10b981' }}>{stats.regularUsers}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <FontAwesomeIcon icon={faUser} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="filter-section">
            <div className="filter-grid">
              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faSearch} />
                  ຄົ້ນຫາ
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ຄົ້ນຫາຊື່, ອີເມວ, ຫຼື ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faFilter} />
                  Role
                </label>
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">ທັງໝົດ</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>ຈັດລຽງຕາມ</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">ຊື່</option>
                  <option value="email">ອີເມວ</option>
                  <option value="role">Role</option>
                </select>
              </div>

              <div className="filter-field">
                <label>ລຳດັບ</label>
                <div className="sort-buttons">
                  <button
                    className={`btn-sort ${sortOrder === "asc" ? "active" : ""}`}
                    onClick={() => setSortOrder("asc")}
                  >
                    <FontAwesomeIcon icon={faSortAmountUp} />
                  </button>
                  <button
                    className={`btn-sort ${sortOrder === "desc" ? "active" : ""}`}
                    onClick={() => setSortOrder("desc")}
                  >
                    <FontAwesomeIcon icon={faSortAmountDown} />
                  </button>
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-clear" onClick={clearAllFilters}>
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                ລ້າງຕົວກອງ
              </button>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                ສະແດງ {filteredUsers.length} ຈາກ {users.length} ລາຍການ
              </span>
            </div>
          </div>

          {/* ✅ Bulk Actions Bar + Export */}
          <div className="d-flex justify-content-end mb-3">
            <button
              type="button"
              className="btn-clear"
              onClick={handleExport}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <i className="fas fa-download"></i>
              Export CSV ({filteredUsers.length})
            </button>
          </div>
          <BulkActionsBar
            count={bulk.selectedCount}
            onClear={bulk.clear}
            actions={[
              { label: 'ລຶບທີ່ເລືອກ', icon: 'fa-trash', variant: 'danger', onClick: handleBulkDelete },
            ]}
          />

          {/* Users Table */}
          <div className="table-section">
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon icon={faUser} size="3x" />
                <h5>ບໍ່ພົບຜູ້ໃຊ້</h5>
                <p>ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ</p>
              </div>
            ) : (
              <div className="table-responsive">
                <MDBDataTable
                  data={tableData}
                  striped
                  hover
                  small
                  noBottomColumns
                  responsive
                  searching={false}
                  paging={true}
                  info={true}
                  entries={10}
                  entriesOptions={[5, 10, 20, 50]}
                  displayEntries={true}
                />
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default ListUsers;