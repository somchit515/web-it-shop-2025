// src/components/OrderStatusUpdate.jsx
import React, { useState } from "react";
import { useUpdateOrderStatusMutation } from "../redux/api/OrderApi";
import { toast, Toaster } from "react-hot-toast";

const STATUS_LIST = ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"];

export default function OrderStatusUpdate({ orderId, onSuccess }) {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const [status, setStatus] = useState("Processing");
  const [shipment, setShipment] = useState("pending");
  const [tracking, setTracking] = useState("");

  const handleSave = async () => {
    try {
      await updateStatus({
        id: orderId,
        orderStatus: status,
        shipmentStatus: shipment,
        trackingCode: tracking,
      }).unwrap();
      toast.success("อัปเดตสถานะสำเร็จ");
      if (onSuccess) onSuccess();        // เรียก parent ถ้าต้องการ refresh หน้า
    } catch (err) {
      toast.error(err?.data?.message || "อัปเดตล้มเหลว");
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <Toaster position="top-right" />
      <h5 className="mb-3">อัปเดตสถานะออร์เดอร์ #{orderId}</h5>

      <div className="mb-3">
        <label className="form-label">สถานะออร์เดอร์</label>
        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">สถานะขนส่ง</label>
        <select className="form-select" value={shipment} onChange={(e) => setShipment(e.target.value)}>
          <option value="pending">ยังไม่ส่ง</option>
          <option value="processing">กำลังเตรียม</option>
          <option value="shipped">จัดส่งแล้ว</option>
          <option value="delivered">ส่งถึงมือ</option>
          <option value="returned">คืนแล้ว</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Tracking Code</label>
        <input type="text" className="form-control" value={tracking} onChange={(e) => setTracking(e.target.value)} />
      </div>

      <button className="btn btn-primary w-100" onClick={handleSave} disabled={isLoading}>
        {isLoading ? "กำลังบันทึก…" : "บันทึก"}
      </button>
    </div>
  );
}