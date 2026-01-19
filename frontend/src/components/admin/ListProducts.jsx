import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { MDBDataTable } from "mdbreact";
import MetaData from "../layout/MetaData";
import {
  useGetAdminProductsQuery,
  useDeleteProductMutation,
} from "../redux/api/productsApi";
import AdminLayout from "../layout/AdminLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faDownload,
  faEdit,
  faImage,
  faTrash,
  faSpinner,
  faFilter,
  faEye,
  faBox,
  faTag,
  faSortAmountDown,
  faSortAmountUp,
  faExclamationTriangle,
  faChartLine,
  faWarning,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

function ListProducts() {
  const navigate = useNavigate();
  const { data, isLoading, error, isError } = useGetAdminProductsQuery();

  const products = useMemo(() => {
    return data && Array.isArray(data.products) ? data.products : [];
  }, [data]);

  const [deleteProduct] = useDeleteProductMutation();
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= 10
    ).length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

    return {
      totalProducts,
      outOfStock,
      lowStock,
      totalValue,
      inStock: totalProducts - outOfStock,
    };
  }, [products]);

  const handleDelete = useCallback(
    async (id, productName) => {
      if (!id) return;
      const ok = window.confirm(
        `ທ່ານແນ່ໃຈບໍ່ວ່າຈະລົບສິນຄ້າ "${productName}" ການກະທຳນີ້ບໍ່ສາມາດຢ້ອນກັບໄດ້`
      );
      if (!ok) return;

      try {
        setDeletingId(id);
        await deleteProduct(id).unwrap();
        toast.success(`ລົບສິນຄ້າ "${productName}" ສຳເລັດ`);
      } catch (err) {
        console.error("Delete product failed:", err);
        const msg = err?.data?.message || err?.error || "ລົບສິນຄ້າລົ້ມເຫຼວ";
        toast.error(msg);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteProduct]
  );

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເອີ້ນຂໍ້ມູນສິນຄ້າ"
      );
      console.error("getAdminProducts error:", error);
    }
  }, [isError, error]);

  const formatPrice = (val) => {
    if (val === undefined || val === null) return "₭0";
    try {
      return new Intl.NumberFormat("lo-LA", {
        style: "currency",
        currency: "LAK",
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      return `₭${Number(val).toLocaleString()}`;
    }
  };

  const exportToExcelOrCSV = async (rows) => {
    const filenameBase = `products_export_${new Date()
      .toISOString()
      .slice(0, 10)}`;
    try {
      const headers = [
        "ID",
        "Name",
        "Category",
        "Price",
        "Stock",
        "Description",
      ];
      const csvRows = [headers.join(",")];
      rows.forEach((p) => {
        const values = [
          p._id || p.id || "",
          p.name || p.title || "",
          p.category || "",
          p.price ?? "",
          p.stock ?? "",
          (p.description || p.shortDescription || "").replace(/\r?\n|\r/g, " "),
        ];
        const safe = values.map((v) => {
          const s = String(v).replace(/"/g, '""');
          if (s.includes(",") || s.includes('"') || s.includes("\n"))
            return `"${s}"`;
          return s;
        });
        csvRows.push(safe.join(","));
      });
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `${filenameBase}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("ສົ່ງອອກ CSV ສຳເລັດ");
    } catch (e) {
      console.error("Export failed:", e);
      toast.error("ສົ່ງອອກລົ້ມເຫຼວ");
    }
  };

  const handleExport = async () => {
    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
      toast.error("ບໍ່ມີສິນຄ້າສຳລັບສົ່ງອອກ");
      return;
    }
    await exportToExcelOrCSV(filtered);
  };

  const getFilteredProducts = useCallback(() => {
    let filtered = products.filter((p) => {
      const searchMatch =
        !searchTerm ||
        (p.name || p.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p._id || "").toLowerCase().includes(searchTerm.toLowerCase());

      const categoryMatch = !categoryFilter || p.category === categoryFilter;

      const stockMatch =
        !stockFilter ||
        (stockFilter === "inStock" && p.stock > 0) ||
        (stockFilter === "outOfStock" && p.stock === 0) ||
        (stockFilter === "lowStock" && p.stock > 0 && p.stock <= 10);

      return searchMatch && categoryMatch && stockMatch;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "name":
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          break;
        case "price":
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
        case "stock":
          aVal = a.stock || 0;
          bVal = b.stock || 0;
          break;
        case "category":
          aVal = (a.category || "").toLowerCase();
          bVal = (b.category || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  const filteredProducts = getFilteredProducts();

  const tableData = useMemo(() => {
    const dataTable = {
      columns: [
        { label: "ສິນຄ້າ", field: "product", sort: "disabled", width: 300 },
        { label: "ປະເພດ", field: "category", sort: "asc" },
        { label: "ລາຄາ", field: "price", sort: "asc" },
        { label: "ສາງ", field: "stock", sort: "asc" },
        { label: "ສະຖານະ", field: "status", sort: "disabled" },
        { label: "ການດຳເນີນ", field: "actions", sort: "disabled" },
      ],
      rows: [],
    };

    filteredProducts.forEach((prod) => {
      const fullId = prod._id || prod.id || "";
      const rawName = prod.name || prod.title || "ບໍ່ມີຊື່";
      const priceText = formatPrice(prod.price);
      const stockValue = prod.stock || 0;

      let statusBadge;
      if (stockValue === 0) {
        statusBadge = <span className="badge bg-danger">ສິນຄ້າໝົດ</span>;
      } else if (stockValue <= 10) {
        statusBadge = (
          <span className="badge bg-warning text-dark">ໃກ້ຈະໝົດ</span>
        );
      } else {
        statusBadge = <span className="badge bg-success">ມີໃນສາງ</span>;
      }

      dataTable.rows.push({
        product: (
          <div className="d-flex align-items-center">
            <div className="product-image me-3">
              {prod.images && prod.images.length > 0 ? (
                <img
                  src={prod.images[0].url}
                  alt={rawName}
                  className="img-fluid rounded"
                  width="60"
                  height="60"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <img
                  src="/images/default_product.png"
                  alt="default"
                  className="img-fluid rounded"
                  width="60"
                  height="60"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </div>

            <div>
              <div className="fw-semibold text-dark">{rawName}</div>
              <small className="text-muted">#{fullId.substring(0, 8)}...</small>
            </div>
          </div>
        ),
        category: (
          <span className="badge bg-light text-dark border">
            <FontAwesomeIcon icon={faTag} className="me-1" />
            {prod.category || "ບໍ່ລະບຸ"}
          </span>
        ),
        price: <div className="fw-bold text-success">{priceText}</div>,
        stock: (
          <div className="d-flex align-items-center">
            <span
              className={`fw-semibold ${
                stockValue === 0
                  ? "text-danger"
                  : stockValue <= 10
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {stockValue}
            </span>
          </div>
        ),
        status: statusBadge,
        actions: (
          <div className="btn-group" role="group">
            <Link
              to={`/product/${fullId}`}
              className="btn btn-outline-info btn-sm"
              title="ເບິ່ງລາຍລະອຽດ"
              target="_blank"
            >
              <FontAwesomeIcon icon={faEye} />
            </Link>

            <Link
              to={`/admin/products/${fullId}`}
              className="btn btn-outline-primary btn-sm"
              title="ແກ້ໄຂ"
            >
              <FontAwesomeIcon icon={faEdit} />
            </Link>

            <Link
              to={`/admin/products/${fullId}/upload_images`}
              className="btn btn-outline-success btn-sm"
              title="ອັບໂຫລດຮູບພາບ"
            >
              <FontAwesomeIcon icon={faImage} />
            </Link>

            <button
              onClick={() => handleDelete(fullId, rawName)}
              className="btn btn-outline-danger btn-sm"
              disabled={deletingId === fullId}
              title="ລົບ"
            >
              {deletingId === fullId ? (
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
  }, [filteredProducts, deletingId, handleDelete]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStockFilter("");
    setSortBy("name");
    setSortOrder("asc");
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title="ຈັດການສິນຄ້າ - Admin" />
      <style>{`
        /* Modern styling for List Products */
        .list-products-container {
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

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .btn-primary-custom {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary-custom:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-export {
          background: white;
          border: 2px solid #10b981;
          color: #10b981;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-export:hover:not(:disabled) {
          background: #10b981;
          color: white;
          transform: translateY(-2px);
        }

        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .stat-card.success::before {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .stat-card.warning::before {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .stat-card.danger::before {
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
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

        .table-responsive {
          border-radius: 16px;
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

        .product-image img {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-weight: 600;
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

        .empty-state p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
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

          .action-buttons {
            flex-direction: column;
          }

          .btn-primary-custom,
          .btn-export {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <AdminLayout>
        <div className="list-products-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb-nav">
              <Link to="/admin/dashboard">
                <FontAwesomeIcon icon={faHome} /> Dashboard
              </Link>
              <span>/</span>
              <span>ຈັດການສິນຄ້າ</span>
            </div>
            <h1 className="page-title">
              <FontAwesomeIcon icon={faBox} />
              ຈັດການສິນຄ້າ
            </h1>
            <p className="page-subtitle">
              ຈັດການສິນຄ້າທັງໝົດໃນລະບົບ, ລວມທັງການເພີ່ມ, ແກ້ໄຂ, ແລະ ລົບ
            </p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn-export"
              onClick={handleExport}
              disabled={filteredProducts.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} />
              ສົ່ງອອກ CSV
            </button>

            <button
              className="btn-primary-custom"
              onClick={() => navigate("/admin/product/new")}
            >
              <FontAwesomeIcon icon={faPlus} />
              ເພີ່ມສິນຄ້າໃໝ່
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ທັງໝົດ</h6>
                  <h4 style={{ color: '#667eea' }}>{stats.totalProducts}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                  <FontAwesomeIcon icon={faBox} />
                </div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ມີໃນສາງ</h6>
                  <h4 style={{ color: '#10b981' }}>{stats.inStock}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ໃກ້ຈະໝົດ</h6>
                  <h4 style={{ color: '#f59e0b' }}>{stats.lowStock}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <FontAwesomeIcon icon={faWarning} />
                </div>
              </div>
            </div>

            <div className="stat-card danger">
              <div className="stat-content">
                <div className="stat-info">
                  <h6>ສິນຄ້າໝົດ</h6>
                  <h4 style={{ color: '#ef4444' }}>{stats.outOfStock}</h4>
                </div>
                <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
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
                  placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ, ປະເພດ, ຫຼື ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faTag} />
                  ປະເພດ
                </label>
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">ທັງໝົດ</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>
                  <FontAwesomeIcon icon={faFilter} />
                  ສາງ
                </label>
                <select
                  className="form-select"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <option value="">ທັງໝົດ</option>
                  <option value="inStock">ມີໃນສາງ</option>
                  <option value="lowStock">ໃກ້ຈະໝົດ</option>
                  <option value="outOfStock">ສິນຄ້າໝົດ</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">ຈັດລຽງຕາມ</label>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">ຊື່</option>
                  <option value="price">ລາຄາ</option>
                  <option value="stock">ສາງ</option>
                  <option value="category">ປະເພດ</option>
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">ລຳດັບ</label>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${
                      sortOrder === "asc" ? "btn-primary" : "btn-outline-primary"
                    } flex-fill`}
                    onClick={() => setSortOrder("asc")}
                  >
                    <FontAwesomeIcon icon={faSortAmountUp} />
                  </button>
                  <button
                    className={`btn btn-sm ${
                      sortOrder === "desc" ? "btn-primary" : "btn-outline-primary"
                    } flex-fill`}
                    onClick={() => setSortOrder("desc")}
                  >
                    <FontAwesomeIcon icon={faSortAmountDown} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={clearAllFilters}
              >
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                ລ້າງຕົວກອງ
              </button>
              <span className="ms-3 text-muted">
                ສະແດງ {filteredProducts.length} ຈາກ {products.length} ລາຍການ
              </span>
            </div>
          </div>

          {/* Products Table (Using product-card style for consistency) */}
          <div className="product-card p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center p-5">
                <FontAwesomeIcon
                  icon={faBox}
                  size="3x"
                  className="text-muted mb-3"
                />
                <h5 className="text-muted mb-2">ບໍ່ພົບສິນຄ້າ</h5>
                <p className="text-muted">
                  ລອງປ່ຽນເງື່ອນໄຂການຄົ້ນຫາ ຫຼື ເພີ່ມສິນຄ້າໃໝ່
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/admin/product/new")}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  ເພີ່ມສິນຄ້າໃໝ່
                </button>
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

export default ListProducts;
