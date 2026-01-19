// src/components/superAdmin/reports/reportService.js

// ✅ แก้ไข Path: เพิ่ม '../' เข้าไปอีกหนึ่งตัว
import { 
    useGetCustomerReportQuery,
    useGetSalesReportQuery,
    useGetReturnsReportQuery,
    useGetIncomeExpenseReportQuery
} from "../../redux/api/productsApi"; // เปลี่ยนจาก '../../' เป็น '../../../'

// Export Hooks ทั้งหมดที่ Component อื่นๆ ใน Reports Folder จะเรียกใช้
export { 
    useGetCustomerReportQuery,
    useGetSalesReportQuery,
    useGetReturnsReportQuery,
    useGetIncomeExpenseReportQuery
};