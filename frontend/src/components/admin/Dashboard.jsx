import React, { useEffect, useState } from 'react'
import AdminLayout from '../layout/AdminLayout'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import SaleChart from '../charts/SaleChart'
import { useLazyGetDashboardSalesQuery } from '../redux/api/OrderApi'
import Loader from "../layout/Loader"
import toast from "react-hot-toast";
// REMOVED: import { data } from 'react-router-dom' - This was unnecessary and conflicting.

function Dashboard() {

  // Initialize with new Date() as a sensible default
  const [startDate, setStartdate] = useState(new Date());
  const [endDate, setEnddate] = useState(new Date());

  // RTK Query lazy hook. Note the data is aliased to 'salesData'.
  // FIX 1: The query data is ALISED to 'salesData', so all references must use 'salesData'.
  const [getDashboardSales, { data: salesData, error, isLoading }] = useLazyGetDashboardSalesQuery();

  // Initial load logic for the current date range
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || 'Failed to fetch dashboard sales.');
    }

    // FIX 2: Correctly reference 'salesData' instead of the undeclared 'data'.
    // Only run the initial fetch if we don't have data yet and are not currently loading.
    if (startDate && endDate && !salesData && !isLoading) { 
      getDashboardSales({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      });
    }
  // FIX 3: Dependency array must be consistent and include all values from the component scope used inside the effect.
  // Note: 'salesData' is included so the effect doesn't re-run the fetch after data arrives.
  }, [error, startDate, endDate, salesData, getDashboardSales, isLoading]);

  const submitHandler = () => {
    // Manual execution of the lazy query
    getDashboardSales({
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString()
    });
  }

  // Destructuring and initial value for display, using the aliased 'salesData'
  const totalSales = salesData?.totalSales || 0;
  // Use 'salesData' and safely access properties. Assuming API returns 'totalNumOrders'.
  const totalOrders = salesData?.totalNumOrders || 0; 

  if(isLoading) return<Loader/>

  return (
    <>
      <AdminLayout>
        <div className="d-flex justify-content-start align-items-center">
          <div className="mb-3 me-4">
            <label className="form-label d-block">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => { setStartdate(date) }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className='form-control'
            />
          </div>
          <div className="mb-3">
            <label className="form-label d-block">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => { setEnddate(date) }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className='form-control'
            />
          </div>
          <button
            className="btn fetch-btn ms-4 mt-3 px-5"
            onClick={submitHandler} // Correct event is onClick
            disabled={isLoading}
          >
            {isLoading ? 'ກຳລັງໂຫລດ...' : 'ຄົ້ນຫາ'}
          </button>
        </div>

        <div className="row pr-4 my-5">
          <div className="col-xl-6 col-sm-12 mb-3">
            <div className="card text-white bg-success o-hidden h-100">
              <div className="card-body">
                <div className="text-center card-font-size">
                  Sales
                  <br />
                  {/* FIX 4: Use the derived variable 'totalSales' */}
                  <b>${totalSales.toFixed(2)}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-sm-12 mb-3">
            <div className="card text-white bg-danger o-hidden h-100">
              <div className="card-body">
                <div className="text-center card-font-size">
                  Orders
                  <br />
                  {/* FIX 5: Use the derived variable 'totalOrders' */}
                  <b>{totalOrders}</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FIX 6: Pass the actual data variable, 'salesData', to the SaleChart component. */}
        <SaleChart salesData={salesData?.sales} />

        <div className="mb-5"></div>
      </AdminLayout>
    </>
  )
}

export default Dashboard