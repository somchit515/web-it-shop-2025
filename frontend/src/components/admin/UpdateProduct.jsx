import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import Loader from '../layout/Loader';
import { useGetProductDetailsQuery, useUpdateProductMutation } from '../redux/api/productsApi';
import AdminLayout from '../layout/AdminLayout';
import { PRODUCT_CATEGORIES } from '../../constans/constans';

function UpdateProduct() {
  const navigate = useNavigate();
  const params = useParams();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    seller: '',
  });

  const { name, description, price, category, stock, seller } = product;

  const onChange = (e) => {
    const { name: key, value } = e.target;
    if (key === 'price') {
      const raw = String(value).replace(/[^\d.-]/g, '');
      setProduct((prev) => ({ ...prev, price: raw }));
    } else if (key === 'stock') {
      const raw = value.replace(/[^\d]/g, '');
      setProduct((prev) => ({ ...prev, stock: raw }));
    } else {
      setProduct((prev) => ({ ...prev, [key]: value }));
    }
  };

  const { data, isLoading: isProductLoading, isError, error } = useGetProductDetailsQuery(params?.id);
  const [updateProduct, { isLoading: isUpdating, isSuccess: isUpdateSuccess, error: updateError }] = useUpdateProductMutation();

  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setProduct({
        name: p.name ?? '',
        description: p.description ?? '',
        price: (p.price !== undefined && p.price !== null) ? String(p.price) : '',
        category: p.category ?? '',
        stock: (p.stock !== undefined && p.stock !== null) ? String(p.stock) : '',
        seller: p.seller ?? '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນສິນຄ້າ');
    }
  }, [isError, error]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError?.data?.message || 'ອັບເດດລົ້ມເຫລວ');
    }
    if (isUpdateSuccess) {
      toast.success('ອັບເດດສິນຄ້າສຳເລັດ!');
      navigate('/admin/products');
    }
  }, [isUpdateSuccess, updateError, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('ກະລຸນາປ້ອນຊື່ສິນຄ້າ');
    if (!price || isNaN(Number(price))) return toast.error('ກະລຸນາປ້ອນລາຄາທີ່ຖືກຕ້ອງ');
    if (!stock || isNaN(Number(stock))) return toast.error('ກະລຸນາປ້ອນຈຳນວນສະຕັອກທີ່ຖືກຕ້ອງ');
    if (!category) return toast.error('ກະລຸນາເລືອກໝວດໝູ່');

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      stock: Number(stock),
      seller: seller.trim(),
    };

    updateProduct({ id: params?.id, body: productData });
  };

  const formatCurrency = (v) => {
    if (v === '' || v === null) return '';
    try {
      return new Intl.NumberFormat('lo-LA', { maximumFractionDigits: 0 }).format(Number(v));
    } catch {
      return v;
    }
  };

  if (isProductLoading) return <Loader />;

  return (
    <>
      <style>{`
        .update-product-container {
          max-width: 1000px;
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

        .product-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .info-banner {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-left: 4px solid #667eea;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
        }

        .info-banner-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-banner-text {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        .product-id-badge {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          color: #667eea;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .form-section-title i {
          color: #667eea;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
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

        .helper-text {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stock-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .stock-low {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
        }

        .stock-medium {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
        }

        .stock-high {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
        }

        .category-preview {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 8px;
          font-size: 0.85rem;
          color: #667eea;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f1f5f9;
        }

        .btn-update {
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

        .btn-update:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-update:disabled {
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

        .btn-delete {
          flex: 0.4;
          padding: 0.875rem 2rem;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 10px;
          border: 2px solid #fecaca;
          background: white;
          color: #dc2626;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }

        @media (max-width: 768px) {
          .product-card {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-update,
          .btn-cancel,
          .btn-delete {
            flex: 1;
          }

          .page-title {
            font-size: 1.5rem;
          }
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .changes-indicator {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #92400e;
        }
      `}</style>

      <AdminLayout>
        <div className="update-product-container">
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
              <span>ອັບເດດ</span>
            </div>
            <h1 className="page-title">
              <i className="fas fa-edit"></i> ອັບເດດຂໍ້ມູນສິນຄ້າ
            </h1>
            <p className="page-subtitle">
              ແກ້ໄຂຂໍ້ມູນສິນຄ້າ, ປັບລາຄາ ແລະ ຄຸ້ມຄອງສະຕັອກ
            </p>
          </div>

          {/* Product Form */}
          <form className="product-card" onSubmit={submitHandler}>
            {/* Product ID Badge */}
            <div className="product-id-badge">
              <i className="fas fa-barcode"></i>
              Product ID: {params?.id}
            </div>

            {/* Info Banner */}
            <div className="info-banner">
              <div className="info-banner-title">
                <i className="fas fa-info-circle"></i>
                ຂໍ້ມູນສຳຄັນ
              </div>
              <p className="info-banner-text">
                ການປ່ຽນແປງຂໍ້ມູນຈະມີຜົນທັນທີ. ກະລຸນາກວດສອບຄວາມຖືກຕ້ອງກ່ອນບັນທຶກ.
              </p>
            </div>

            {/* Basic Information */}
            <div className="form-section">
              <div className="form-section-title">
                <i className="fas fa-info-circle"></i>
                ຂໍ້ມູນພື້ນຖານ
              </div>

              <div className="form-group">
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
                />
              </div>

              <div className="form-group">
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
                <div className="form-group">
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

                <div className="form-group">
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
                  {stock && (
                    <div className={`stock-indicator ${
                      Number(stock) < 10 ? 'stock-low' : 
                      Number(stock) < 50 ? 'stock-medium' : 
                      'stock-high'
                    }`}>
                      <i className={`fas fa-${
                        Number(stock) < 10 ? 'exclamation-triangle' : 
                        Number(stock) < 50 ? 'info-circle' : 
                        'check-circle'
                      }`}></i>
                      {Number(stock) < 10 ? 'ສະຕັອກໃກ້ໝົດ' : 
                       Number(stock) < 50 ? 'ສະຕັອກປານກາງ' : 
                       'ສະຕັອກພຽງພໍ'}
                    </div>
                  )}
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
                <div className="form-group">
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
                    {PRODUCT_CATEGORIES?.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {category && (
                    <div className="category-preview">
                      <i className="fas fa-tag"></i>
                      {category}
                    </div>
                  )}
                </div>

                <div className="form-group">
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
                disabled={isUpdating}
              >
                <i className="fas fa-times"></i> ຍົກເລີກ
              </button>
              <button
                type="submit"
                className="btn-update"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <i className="fas fa-spinner spinner-icon"></i>
                    ກຳລັງອັບເດດ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    ບັນທຶກການປ່ຽນແປງ
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

export default UpdateProduct;