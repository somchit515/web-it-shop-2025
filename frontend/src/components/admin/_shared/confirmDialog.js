// confirmDialog.js — re-export ของ confirmDialogStore.js
// ⚠️ ไฟล์นี้ถูกย้ายไป confirmDialogStore.js เพื่อหลีกเลี่ยง case-collision
//    กับ ConfirmDialog.jsx บน Windows filesystem
//    เก็บไฟล์นี้ไว้เพื่อ backward compat — import เก่าๆ ยังใช้ได้
export { confirmDialog } from './confirmDialogStore';
