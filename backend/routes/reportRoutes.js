// backend/routes/reportRoutes.js
import express from 'express';
const router = express.Router();

import { isAuthenticatedUser, isSuperAdmin } from '../middlewares/auth.js'; 

import {
    getAllCustomersReport,
    getOrdersAndSalesReport,
    getCancellationsAndReturnsReport,
    getIncomeAndExpenseReport
} from '../controllers/reportController.js'; 

// 1.1 รายงานข้อมูลลูกค้า
router.route('/admin/reports/customer').get(isAuthenticatedUser, isSuperAdmin, getAllCustomersReport);

// 1.2 รายงานข้อมูลยอดขาย (Dashboard)
router.route('/admin/reports/sales').get(isAuthenticatedUser, isSuperAdmin, getOrdersAndSalesReport);

// 1.3 รายงานข้อมูลการยกเลิก/ส่งคืน
router.route('/admin/reports/returns').get(isAuthenticatedUser, isSuperAdmin, getCancellationsAndReturnsReport);

// 1.4 รายงานการเงิน (Finance Report) - รองรับ path: /admin/reports/finance
router.route('/admin/reports/finance').get(isAuthenticatedUser, isSuperAdmin, getIncomeAndExpenseReport);
// หรือจะใช้ชื่อเดิมก็ได้
router.route('/admin/reports/income-expense').get(isAuthenticatedUser, isSuperAdmin, getIncomeAndExpenseReport);

export default router;