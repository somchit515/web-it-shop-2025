import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import AdminLayout from '../layout/AdminLayout';
import { useCreateProductMutation } from '../redux/api/productsApi';
import { slugToKey } from '../../utils/categories';
import useCategories from '../../utils/useCategories';

function NewProduct() {
  const { categories } = useCategories();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    seller: '',
  });

  const { name, description, price, category, stock, seller } = product;

  const [createProduct, { isLoading: isCreating, error: createError, isSuccess }] =
    useCreateProductMutation();

  useEffect(() => {
    if (createError) toast.error(createError?.data?.message || 'ມີຂໍ້ຜິດພາດ');
    if (isSuccess) {
      toast.success('ສິນຄ້າໃໝ່ໄດ້ຖືກສ້າງ');
      navigate('/admin/products');
    }
  }, [createError, isSuccess, navigate]);

  const onChange = (e) => {
    const { name: field, value } = e.target;
    if (field === 'price') {
      const raw = String(value).replace(/[^\d.-]/g, '');
      setProduct((p) => ({ ...p, price: raw }));
    } else if (field === 'stock') {
      const raw = value.replace(/[^\d]/g, '');
      setProduct((p) => ({ ...p, stock: raw }));
    } else {
      setProduct({ ...product, [field]: value });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const payload = {
      ...product,
      price: price !== '' ? parseFloat(price) : 0,
      stock: stock !== '' ? parseInt(stock, 10) : 0,
      category: String(category || '').trim(),
    };
    createProduct(payload);
  };

  // Excel import logic
  const [importPreview, setImportPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);

  const FIELD_KEYS = ['name', 'description', 'price', 'category', 'stock', 'seller'];

  const validateRow = (r) => {
    const errors = [];
    if (!r.name || String(r.name).trim() === '') errors.push('Missing name');
    const priceNum = Number(r.price);
    if (r.price !== '' && (Number.isNaN(priceNum) || !isFinite(priceNum))) errors.push('Invalid price');
    const stockNum = Number(r.stock);
    if (r.stock !== '' && (Number.isNaN(stockNum) || !Number.isInteger(stockNum))) errors.push('Invalid stock');
    return errors;
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const normalized = rawJson.map((row, rowIndex) => {
          const obj = {};
          Object.keys(row).forEach((header) => {
            const lower = header.toString().trim().toLowerCase();
            const matched = FIELD_KEYS.find((k) => k === lower);
            if (matched) {
              obj[matched] = row[header];
            } else {
              if (lower.includes('name')) obj.name = obj.name ?? row[header];
              if (lower.includes('desc')) obj.description = obj.description ?? row[header];
              if (lower.includes('price') || lower.includes('cost')) obj.price = obj.price ?? row[header];
              if (lower.includes('cat')) obj.category = obj.category ?? row[header];
              if (lower.includes('stock') || lower.includes('qty') || lower.includes('quantity')) obj.stock = obj.stock ?? row[header];
              if (lower.includes('seller')) obj.seller = obj.seller ?? row[header];
            }
          });

          FIELD_KEYS.forEach((k) => {
            if (obj[k] === undefined) obj[k] = '';
          });

          Object.keys(obj).forEach((k) => {
            if (typeof obj[k] === 'string') obj[k] = obj[k].trim();
          });

          const priceVal = parseFloat(obj.price || 0);
          const stockVal = parseInt(obj.stock || 0, 10);

          const rowObj = {
            __row: rowIndex + 2,
            name: obj.name || '',
            description: obj.description || '',
            price: obj.price === '' ? '' : (Number.isNaN(priceVal) ? obj.price : priceVal),
            category: obj.category || '',
            stock: obj.stock === '' ? '' : (Number.isNaN(stockVal) ? obj.stock : stockVal),
            seller: obj.seller || '',
          };

          rowObj._errors = validateRow(rowObj);
          return rowObj;
        });

        setImportPreview(normalized);
        toast.success(`ອ່ານສຳເລັດ ${normalized.length} ແຖວ`);
      } catch (err) {
        console.error(err);
        toast.error('ອ່ານໄຟລ໌ບໍ່ສຳເລັດ');
      }
    };

    reader.onerror = () => {
      toast.error('ບໍ່ສາມາດອ່ານໄຟລ໌');
    };

    reader.readAsBinaryString(file);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onFileSelected(f);
    e.target.value = null;
  };

  const onFileSelected = (f) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(f.type) && !f.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error('ກະລຸນາເລືອກໄຟລ໌ Excel (.xlsx/.xls/.csv)');
      return;
    }
    parseFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFileSelected(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const clearPreview = () => setImportPreview([]);

  const downloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'category', 'stock', 'seller'];
    const sample = ['Sample Product', 'Short description here', 19990, categories?.[0]?.key || 'electronics', 10, 'YourSeller'];
    const aoa = [headers, sample];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'product_template');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  const importAndCreate = async () => {
    if (!importPreview || importPreview.length === 0) {
      return toast.warn('ບໍ່ມີຂໍ້ມູນທີ່ຈະນຳເຂົ້າ');
    }

    const validRows = importPreview.filter((r) => !r._errors || r._errors.length === 0);
    if (validRows.length === 0) {
      return toast.error('ບໍ່ມີແຖວທີ່ຖືກຕ້ອງ');
    }

    setImportLoading(true);
    setImportProgress({ current: 0, total: validRows.length });

    const failures = [];
    let succeeded = 0;

    for (let i = 0; i < validRows.length; i += 1) {
      const r = validRows[i];
      const normalizedCategory = String(r.category || '').trim();
      const dbCategory = slugToKey(normalizedCategory || '');

      const payload = {
        name: String(r.name || '').trim(),
        description: String(r.description || '').trim(),
        price: r.price === '' ? 0 : Number(r.price),
        category: dbCategory || '',
        stock: r.stock === '' ? 0 : Number(r.stock),
        seller: String(r.seller || '').trim(),
      };

      try {
        await createProduct(payload).unwrap();
        succeeded += 1;
      } catch (err) {
        failures.push({ row: r.__row, reason: err?.data?.message || err?.message || 'Request failed' });
      }

      setImportProgress({ current: i + 1, total: validRows.length });
    }

    setImportLoading(false);
    setImportProgress({ current: 0, total: 0 });

    toast.success(`ນຳເຂົ້າສຳເລັດ: ${succeeded} ສິນຄ້າ, ${failures.length} ລົ້ມເຫລວ`);
    if (failures.length > 0) {
      console.table(failures);
      toast.info('ກວດສອບ console ສຳລັບລາຍລະອຽດ');
    }
    if (succeeded > 0) setImportPreview([]);
  };

  const formatCurrency = (v) => {
    if (v === '' || v === null) return '';
    try {
      return new Intl.NumberFormat('lo-LA', { maximumFractionDigits: 0 }).format(Number(v));
    } catch {
      return v;
    }
  };

  return (
    <>
      <style>{`
        .new-product-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #718096;
          font-size: 0.95rem;
          margin: 0;
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 0.5rem;
        }

        .breadcrumb-nav a {
          color: #667eea;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb-nav a:hover {
          color: #764ba2;
        }

        .section-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(102, 126, 234, 0.1);
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title i {
          color: #667eea;
          font-size: 1.3rem;
        }

        .section-desc {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .drag-drop-area {
          border: 3px dashed #cbd5e1;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          background: #f8fafc;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .drag-drop-area.active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          transform: scale(1.02);
        }

        .drag-drop-icon {
          font-size: 3rem;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .drag-drop-area.active .drag-drop-icon {
          color: #667eea;
        }

        .drag-drop-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .drag-drop-text {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .btn-modern {
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 10px;
          border: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary-modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary-modern:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }

        .btn-outline-modern {
          background: white;
          border: 2px solid #e2e8f0;
          color: #64748b;
        }

        .btn-outline-modern:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .preview-container {
          margin-top: 1.5rem;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .preview-title {
          font-weight: 600;
          color: #2d3748;
          font-size: 1rem;
        }

        .preview-count {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .preview-table-wrapper {
          max-height: 400px;
          overflow: auto;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }

        .preview-table {
          width: 100%;
          font-size: 0.875rem;
        }

        .preview-table thead {
          position: sticky;
          top: 0;
          background: #f8fafc;
          z-index: 10;
        }

        .preview-table th {
          padding: 0.75rem;
          font-weight: 600;
          color: #64748b;
          border-bottom: 2px solid #e2e8f0;
          text-align: left;
        }

        .preview-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .preview-table tr.error-row {
          background: #fef2f2;
        }

        .status-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        .status-ok {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .status-error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .form-section-title i {
          color: #667eea;
        }

        .form-label {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-label i {
          color: #667eea;
          font-size: 0.85rem;
        }

        .form-control,
        .form-select,
        textarea {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .form-control:focus,
        .form-select:focus,
        textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: white;
          outline: none;
        }

        textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .helper-text {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f1f5f9;
        }

        .btn-submit {
          flex: 1;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancel {
          flex: 0.4;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .section-card {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-submit,
          .btn-cancel {
            flex: 1;
          }
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-bar-modern {
          height: 8px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin: 1rem 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }
      `}</style>

      <AdminLayout>
        <div className="new-product-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb-nav">
              <a href="/admin/dashboard">
                <i className="fas fa-home"></i> Dashboard
              </a>
              <span>/</span>
              <a href="/admin/products">
                <i className="fas fa-boxes"></i> ສິນຄ້າ
              </a>
              <span>/</span>
              <span>ເພີ່ມສິນຄ້າໃໝ່</span>
            </div>
            <h1 className="page-title">
              <i className="fas fa-plus-circle"></i> ເພີ່ມສິນຄ້າໃໝ່
            </h1>
            <p className="page-subtitle">
              ສ້າງສິນຄ້າໃໝ່ທີລະອັນ ຫຼື ນຳເຂົ້າຫຼາຍອັນພ້ອມກັນຜ່ານ Excel
            </p>
          </div>

          {/* Import Section */}
          <div className="section-card">
            <div className="section-header">
              <div>
                <div className="section-title">
                  <i className="fas fa-file-excel"></i>
                  ນຳເຂົ້າຈາກ Excel
                </div>
                <div className="section-desc">
                  ນຳເຂົ້າສິນຄ້າຫຼາຍອັນພ້ອມກັນຜ່ານໄຟລ໌ Excel (.xlsx, .xls, .csv)
                </div>
              </div>
              <button 
                type="button" 
                className="btn-modern btn-outline-modern"
                onClick={downloadTemplate}
              >
                <i className="fas fa-download"></i>
                ດາວໂຫຼດແບບຟອມ
              </button>
            </div>

            <div
              className={`drag-drop-area ${dragActive ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              onClick={() => fileRef.current?.click()}
            >
              <div className="drag-drop-icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <div className="drag-drop-title">
                ລາກໄຟລ໌ມາວາງທີ່ນີ້
              </div>
              <div className="drag-drop-text">
                ຫຼື ກົດເພື່ອເລືອກໄຟລ໌ (.xlsx, .xls, .csv)
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={onFileChange}
                style={{ display: 'none' }}
              />
              <button type="button" className="btn-modern btn-primary-modern">
                <i className="fas fa-folder-open"></i>
                ເລືອກໄຟລ໌
              </button>
            </div>

            {/* Preview */}
            {importPreview?.length > 0 && (
              <div className="preview-container">
                <div className="preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="preview-title">ຂໍ້ມູນຕົວຢ່າງ</span>
                    <span className="preview-count">{importPreview.length} ແຖວ</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      type="button" 
                      className="btn-modern btn-outline-modern"
                      onClick={clearPreview}
                      disabled={importLoading}
                    >
                      <i className="fas fa-trash-alt"></i>
                      ລ້າງ
                    </button>
                    <button
                      type="button"
                      className="btn-modern btn-primary-modern"
                      onClick={importAndCreate}
                      disabled={importLoading || importPreview.filter(r => !r._errors || r._errors.length === 0).length === 0}
                    >
                      {importLoading ? (
                        <>
                          <i className="fas fa-spinner spinner-icon"></i>
                          ນຳເຂົ້າ {importProgress.current}/{importProgress.total}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload"></i>
                          ນຳເຂົ້າສິນຄ້າ
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {importLoading && (
                  <div className="progress-bar-modern">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                )}

                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>ແຖວ</th>
                        <th style={{ minWidth: '200px' }}>ຊື່ສິນຄ້າ</th>
                        <th style={{ width: '100px' }}>ລາຄາ</th>
                        <th style={{ width: '80px' }}>ສະຕັອກ</th>
                        <th style={{ width: '120px' }}>ໝວດໝູ່</th>
                        <th style={{ width: '120px' }}>ຜູ້ຂາຍ</th>
                        <th style={{ width: '120px' }}>ສະຖານະ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((r, idx) => (
                        <tr key={idx} className={r._errors?.length ? 'error-row' : ''}>
                          <td>{r.__row || idx + 1}</td>
                          <td>{r.name || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                          <td>{r.price ? formatCurrency(r.price) : '—'}</td>
                          <td>{r.stock || '—'}</td>
                          <td>{r.category || '—'}</td>
                          <td>{r.seller || '—'}</td>
                          <td>
                            {r._errors?.length ? (
                              <span className="status-badge status-error">
                                {r._errors[0]}
                              </span>
                            ) : (
                              <span className="status-badge status-ok">
                                <i className="fas fa-check"></i> ພ້ອມ
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Manual Form */}
          <form className="section-card" onSubmit={submitHandler}>
            <div className="section-title" style={{ marginBottom: '1.5rem' }}>
              <i className="fas fa-edit"></i>
              ເພີ່ມສິນຄ້າດ້ວຍຕົນເອງ
            </div>

            {/* Basic Information */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-info-circle"></i>
                ຂໍ້ມູນພື້ນຖານ
              </div>

              <div className="mb-3">
                <label htmlFor="name_field" className="form-label">
                  <i className="fas fa-tag"></i>
                  ຊື່ສິນຄ້າ
                </label>
                <input 
                  type="text" 
                  id="name_field" 
                  className="form-control" 
                  name="name" 
                  value={name} 
                  onChange={onChange} 
                  placeholder="ປ້ອນຊື່ສິນຄ້າ"
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description_field" className="form-label">
                  <i className="fas fa-align-left"></i>
                  ລາຍລະອຽດສິນຄ້າ
                </label>
                <textarea 
                  className="form-control" 
                  id="description_field" 
                  name="description" 
                  value={description} 
                  onChange={onChange}
                  placeholder="ອະທິບາຍລາຍລະອຽດສິນຄ້າ..."
                ></textarea>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-dollar-sign"></i>
                ລາຄາ ແລະ ສະຕັອກ
              </div>

              <div className="form-row">
                <div className="mb-3">
                  <label htmlFor="price_field" className="form-label">
                    <i className="fas fa-money-bill-wave"></i>
                    ລາຄາສິນຄ້າ (LAK)
                  </label>
                  <input
                    type="text"
                    id="price_field"
                    className="form-control"
                    name="price"
                    value={formatCurrency(price)}
                    onChange={(e) => {
                      const raw = String(e.target.value).replace(/[^\d.-]/g, '');
                      setProduct((p) => ({ ...p, price: raw }));
                    }}
                    placeholder="0"
                    inputMode="numeric"
                  />
                  <div className="helper-text">
                    <i className="fas fa-info-circle"></i>
                    ລາຄາຈະຖືກຈັດຮູບແບບອັດຕະໂນມັດ
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="stock_field" className="form-label">
                    <i className="fas fa-boxes"></i>
                    ຈຳນວນສິນຄ້າໃນສະຕັອກ
                  </label>
                  <input 
                    type="number" 
                    id="stock_field" 
                    className="form-control" 
                    name="stock" 
                    value={stock} 
                    onChange={onChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Category & Seller */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-layer-group"></i>
                ໝວດໝູ່ ແລະ ຜູ້ຂາຍ
              </div>

              <div className="form-row">
                <div className="mb-3">
                  <label htmlFor="category_field" className="form-label">
                    <i className="fas fa-th-large"></i>
                    ໝວດໝູ່ສິນຄ້າ
                  </label>
                  <select 
                    className="form-select" 
                    id="category_field" 
                    name="category" 
                    value={category} 
                    onChange={onChange}
                  >
                    <option value="">-- ເລືອກໝວດໝູ່ --</option>
                    {categories?.map((cat) => (
                      <option key={cat.key || cat.slug} value={cat.key || cat.slug}>
                        {cat.title || cat.key || cat.slug}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="seller_field" className="form-label">
                    <i className="fas fa-store"></i>
                    ຊື່ຜູ້ຂາຍ
                  </label>
                  <input 
                    type="text" 
                    id="seller_field" 
                    className="form-control" 
                    name="seller" 
                    value={seller} 
                    onChange={onChange}
                    placeholder="ຊື່ຜູ້ຂາຍ ຫຼື ຮ້ານຄ້າ"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/admin/products')}
                disabled={isCreating}
              >
                <i className="fas fa-times"></i> ຍົກເລີກ
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <i className="fas fa-spinner spinner-icon"></i>
                    ກຳລັງສ້າງສິນຄ້າ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle"></i>
                    ສ້າງສິນຄ້າໃໝ່
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}

export default NewProduct;