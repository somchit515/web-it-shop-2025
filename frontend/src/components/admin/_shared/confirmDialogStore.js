// confirmDialogStore.js — singleton API สำหรับเรียก confirm modal จากทุกที่
// ⚠️ เปลี่ยนชื่อจาก confirmDialog.js เพื่อหลีกเลี่ยงการชนกับ ConfirmDialog.jsx
//    บน Windows filesystem (case-insensitive)
// ใช้: const ok = await confirmDialog.show({ title, message, variant: 'danger' });

let listeners = [];
let pendingResolve = null;

export const confirmDialog = {
  /** เปิด modal และ resolve true/false ตามผู้ใช้กด */
  show(options = {}) {
    return new Promise((resolve) => {
      pendingResolve = resolve;
      const payload = {
        open: true,
        title: options.title || 'ຢືນຢັນການກະທຳ',
        message: options.message || '',
        confirmText: options.confirmText || 'ຢືນຢັນ',
        cancelText: options.cancelText || 'ຍົກເລີກ',
        variant: options.variant || 'primary', // 'primary' | 'danger' | 'warning'
        icon: options.icon, // optional fa icon class
      };
      listeners.forEach((l) => l(payload));
    });
  },
  /** ใช้ภายใน <ConfirmDialog/> ตอนผู้ใช้กดปุ่ม */
  _resolve(value) {
    if (pendingResolve) pendingResolve(value);
    pendingResolve = null;
    listeners.forEach((l) => l({ open: false }));
  },
  /** subscribe ใช้โดย component */
  _subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((x) => x !== listener);
    };
  },
};
