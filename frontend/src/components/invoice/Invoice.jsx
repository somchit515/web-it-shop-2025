import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetOrderDetailsQuery } from "../redux/api/OrderApi";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import "./Invoice.css"; // Assuming your styling is defined here

function Invoice() {
  const params = useParams(); // Get the order ID from the URL: /invoice/order/:id

  // Fetch order details using RTK Query hook
  const { data, isLoading, error } = useGetOrderDetailsQuery(params.id);
  const order = data?.order;

  // Destructure order data for easy access
  const {
    shippingInfo,
    paymentInfo,
    orderItems,
    user,
    itemsPrice,
    shippingAmount,
    taxAmount,
    totalAmount,
    orderStatus,
    createdAt,
  } = order || {};

  // --- Utility Functions ---

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Use 'lo-LA' (Lao) locale for date formatting for consistency,
    // or keep 'en-US' if you prefer Western style dates. Using 'lo-LA' here.
    return new Date(dateString).toLocaleDateString("lo-LA");
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "₭0";
    return "₭" + Number(amount).toLocaleString("lo-LA");
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Effects ---

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Error fetching invoice data.");
    }
  }, [error]);

  // --- Loading and Error States ---

  if (isLoading) return <Loader />;

  if (error || !order) {
    return (
      <p className="text-center mt-5">
        ຂໍອະໄພ, ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໃບເກັບເງິນສຳລັບເລກທີ່: {params.id}
      </p>
    );
  }

  // --- Component Render ---
  return (
    <>
      <MetaData title={`ໃບເກັບເງິນ ${order?._id.substring(0, 10)}`} />

      <div className="order-invoice my-5">
        {/* Print Button - START */}
        <div className="row d-flex justify-content-center mb-5">
          <button
            className="btn btn-success col-md-5"
            onClick={handlePrint}
            disabled={isLoading}
          >
            <i className="fa fa-print"></i> ດາວໂຫຼດໃບເກັບເງິນ
          </button>
        </div>
        {/* Print Button - END */}

        {/* INVOICE CONTENT - START */}
        <div id="order_invoice" className="p-3 border border-secondary">
          <header className="clearfix">
            <div id="logo">
              {/* NOTE: Adjust path to your logo if necessary */}
              <img src="/images/logo.png" alt="IT HUBB Supply" />
            </div>

            {/* Order ID - Translated */}
            <h1>ໃບເກັບເງິນ</h1>

            {/* Company Info - Translated */}
            <div id="company" className="clearfix">
              <div>IT HUBB Supply CO,. LTD</div>
              <div>
                ຖະໜົນເລກ 7,
                <br />
                ຊຽງຂວາງ, ລາວ
              </div>
              <div>(+856 20) 57047171 </div>
              <div>
                <a href="mailto:info@ithubb.com">info@ithubb.com</a>
              </div>
            </div>

            {/* Customer & Order Info - Translated */}
            <div id="project">
              <div>
                <span>ຊື່</span> {user?.name || "N/A"}
              </div>
              <div>
                <span>ອີເມວ</span> {user?.email || "N/A"}
              </div>
              <div>
                <span>ເບີໂທ</span> {shippingInfo?.phoneNo || "N/A"}
              </div>
              <div>
                <span>ທີ່ຢູ່</span>
                {shippingInfo
                  ? `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}, ${shippingInfo.country}`
                  : "N/A"}
              </div>
              <div>
                <span>ວັນທີ</span> {formatDate(createdAt)}
              </div>
              {/* Payment Status */}
              <div
                className={
                  paymentInfo?.status === "Paid" ||
                  paymentInfo?.status === "succeeded"
                    ? "greenColor"
                    : "redColor"
                }
              >
                <span>ສະຖານະ</span>{" "}
                {paymentInfo?.status === "Paid" ||
                paymentInfo?.status === "succeeded"
                  ? "ຊຳລະແລ້ວ"
                  : orderStatus}
              </div>
            </div>
          </header>

          <main>
            {/* Product Table - Translated Headers */}
            <table className="mt-5">
              <thead>
                <tr>
                  <th className="service">ID</th>
                  <th className="desc">ຊື່ລາຍການສິນຄ້າ</th>
                  <th>ລາຄາ(ຕໍ່ຫົວໜ່ວຍ)</th>
                  <th>ຈຳນວນ</th>
                  <th>ລວມລາຄາ</th>
                </tr>
              </thead>
              <tbody>
                {/* Loop over order items */}
                {orderItems?.map((item, index) => (
                  <tr key={item.product}>
                    <td className="service">{index + 1}</td>
                    <td className="desc">{item.name}</td>
                    <td className="unit">{formatCurrency(item.price)}</td>
                    <td className="qty">{item.quantity}</td>
                    <td className="total">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}

                {/* ✅ Inclusive Tax Model — ใบกำกับภาษีถูกต้องตามมาตรฐานลาว
                    - ลาคาสินค้า (รวม VAT) — ที่ลูกค้าจ่ายจริง
                    - ค่าขนส่ง
                    - ลวมทั้งหมด = ลาคาสินค้า + ค่าขนส่ง
                    - หมายเหตุ: VAT 10% ที่ฝังอยู่ในลาคา = X */}
                <tr>
                  <td colSpan="4">
                    <b>ລາຄາສິນຄ້າ (ລວມ VAT)</b>
                  </td>
                  <td className="total">{formatCurrency(itemsPrice)}</td>
                </tr>

                <tr>
                  <td colSpan="4">
                    <b>ຄ່າຂົນສົ່ງ</b>
                  </td>
                  <td className="total">{formatCurrency(shippingAmount)}</td>
                </tr>

                <tr>
                  <td colSpan="4" className="grand total">
                    <b>ລວມລາຄາທັງໝົດ</b>
                  </td>
                  <td className="grand total">{formatCurrency(totalAmount)}</td>
                </tr>

                {/* แสดง VAT แยกเพื่อ compliance — ไม่บวกใน total */}
                <tr style={{ background: '#f9fafb' }}>
                  <td colSpan="4" style={{ fontStyle: 'italic', color: '#6b7280' }}>
                    ★ ອມພ (VAT 10%) ທີ່ລວມໃນລາຄາສິນຄ້າແລ້ວ
                  </td>
                  <td style={{ fontStyle: 'italic', color: '#6b7280' }}>
                    {formatCurrency(taxAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div id="notices">
              <div>ໝາຍເຫດ:</div>
              <div className="notice">
                ຈະມີການເອີ້ນເກັບເງິນຄ່າທຳນຽມ 1.5% ຈາກຍອດ
                ຄົງເຫຼືອທີ່ຍັງບໍ່ໄດ້ຊຳລະຫຼັງຈາກ 30 ວັນ.
              </div>
            </div>
          </main>

          <footer>
            ໃບເກັບເງິນຖືກສ້າງຂຶ້ນດ້ວຍລະບົບຄອມພິວເຕີ ແລະ
            ສາມາດນໍາໃຊ້ໄດ້ໂດຍບໍ່ມີລາຍເຊັນ.
          </footer>
        </div>
        {/* INVOICE CONTENT - END */}
      </div>
    </>
  );
}

export default Invoice;
