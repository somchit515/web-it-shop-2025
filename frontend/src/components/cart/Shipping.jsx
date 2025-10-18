import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import MetaData from '../layout/MetaData'; 
import { saveShippingInfo } from '../redux/features/shippingSlice'; 
// 💡 Correctly importing the object containing all countries
import { countries as countryData } from 'countries-list'; 
import CheckoutStep from './CheckoutStep';


// ----------------- Data Transformation -----------------
// Convert the countries-list object into an array of { code, name } objects for easy mapping
const countries = Object.values(countryData)
    // Map over the country objects to create a simple array for the dropdown
    .map(country => ({
        code: country.code,
        name: country.name // The full English name of the country
    }))
    // Optional: Sort the list alphabetically by name
    .sort((a, b) => a.name.localeCompare(b.name));


function Shipping() {
    // console.log(countries); // You can check the sorted array here

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // The useSelector hook MUST be called inside the component function!
    const { shippingInfo } = useSelector((state) => state.shipping); 
    
    // Set initial state from Redux/Local Storage data
    const [address, setAddress] = React.useState(shippingInfo.address || "");
    const [province, setProvince] = React.useState(shippingInfo.province || ""); 
    const [city, setCity] = React.useState(shippingInfo.city || "");
    const [phoneNo, setPhoneNo] = React.useState(shippingInfo.phoneNo || "");
    const [zipCode, setZipCode] = React.useState(shippingInfo.zipCode || "");
    // Use the stored country name, or default to "Laos" if not found
    const [country, setCountry] = React.useState(shippingInfo.country || "Laos"); 

    // ----------------- Handlers -----------------

    const submitHandler = (e) => {
        e.preventDefault();

        // Basic validation
        if (phoneNo.length < 9 || phoneNo.length > 15) {
            return toast.error("ເບີໂທບໍ່ຖືກຕ້ອງ");
        }
        
        const data = {
            address,
            province, 
            city,
            phoneNo,
            zipCode,
            country,
        };

        // Save the shipping data to Redux and Local Storage
        dispatch(saveShippingInfo(data));

        // Navigate to the next checkout step
        navigate("/confirm_order");
    };

    // ----------------- Component Render -----------------

    return (
        <>
            <MetaData title={'ຂໍ້ມູນຂົນສົ່ງ'} />
            <CheckoutStep  shipping />
            
            <div className="row wrapper mb-5">
                <div className="col-10 col-lg-5">
                    <form
                        className="shadow rounded bg-body"
                        onSubmit={submitHandler}
                    >
                        <h2 className="mb-4">ຂໍ້ມູນຂົນສົ່ງ</h2>
                        
                        {/* Address Field */}
                        <div className="mb-3">
                            <label htmlFor="address_field" className="form-label">ທີ່ຢູ່</label>
                            <input
                                type="text"
                                id="address_field"
                                className="form-control"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        {/* Province (ແຂວງ) */}
                        <div className="mb-3">
                            <label htmlFor="province_field" className="form-label">ແຂວງ</label>
                            <input
                                type="text"
                                id="province_field"
                                className="form-control"
                                name="province"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                required
                            />
                        </div>

                        {/* City Field */}
                        <div className="mb-3">
                            <label htmlFor="city_field" className="form-label">ເມືອງ</label>
                            <input
                                type="text"
                                id="city_field"
                                className="form-control"
                                name="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>

                        {/* Phone Number Field */}
                        <div className="mb-3">
                            <label htmlFor="phone_field" className="form-label">ເບີໂທ</label>
                            <input
                                type="tel"
                                id="phone_field"
                                className="form-control"
                                name="phoneNo"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                                required
                            />
                        </div>

                        {/* Zip Code Field */}
                        <div className="mb-3">
                            <label htmlFor="zip_code_field" className="form-label">ລະຫັດໄປສະນີ</label>
                            <input
                                type="number"
                                id="zip_code_field"
                                className="form-control"
                                name="zipCode"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                required
                            />
                        </div>

                        {/* Country Field */}
                        <div className="mb-3">
                            <label htmlFor="country_field" className="form-label">ປະເທດ</label>
                            <select
                                id="country_field"
                                className="form-select"
                                name="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            >
                                {/* Mapping over the full, sorted country list */}
                                {countries.map((country) => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button id="shipping_btn" type="submit" className="btn w-100 py-2">
                            CONTINUE
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Shipping;