import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileMutation } from '../redux/api/userApi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Userlayout from '../layout/Userlayout';
import MetaData from '../layout/MetaData'

function UpdateProfile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const navigate = useNavigate();

    const [updateProfile, { isLoading, error, isSuccess }] = useUpdateProfileMutation();

    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        // Initialize form with user data
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }

        // Handle API errors
        if (error) {
            toast.error(error?.data?.message);
        }

        // Handle successful update
        if (isSuccess) {
            toast.success("ອັບເດດໂປຣໄຟລ໌ສຳເລັດ");
            navigate("/me/profile");
        }
        
        // 🛑 Corrected Dependency Array
    }, [user, error, isSuccess, navigate]);


    const SubmitHandles = (e) => { // Removed 'async' since updateProfile is not awaited
        e.preventDefault();
        const userData = { name, email };
        updateProfile(userData);
    };


    return (
         <>
    <MetaData title={'ອັບເດດໂປຣໄຟລ໌'} />
      <Userlayout>
        <div className="row wrapper">
            <div className="col-10 col-lg-8">
                <form
                    className="shadow rounded bg-body"
                    onSubmit={SubmitHandles}
                >
                    <h2 className="mb-4">ອັບເດດໂປຣໄຟລ໌</h2>

                    <div className="mb-3">
                        <label htmlFor="name_field" className="form-label"> ຊື່ ແລະ ນາມສະກຸນ</label>
                        <input
                            type="text"
                            id="name_field"
                            className="form-control"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email_field" className="form-label"> ອີເມວ </label>
                        <input
                            type="email"
                            id="email_field"
                            className="form-control"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn update-btn w-100" disabled={isLoading}>{isLoading ? "ກະລຸນາລໍຖໍ" : "ອັບເດດ"}</button>
                </form>
            </div>
        </div>
        </Userlayout>
        </>
    )
}

export default UpdateProfile