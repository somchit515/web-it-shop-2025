import React from 'react'
import Userlayout from '../layout/Userlayout'

import { useSelector } from 'react-redux';
import MetaData from '../layout/MetaData'

function Profile() {

    const {user} = useSelector((state) => state.auth);

    return (
         <>
    <MetaData title={'ໂປຣຟາຍ'} />
        <Userlayout>
            <div className="row justify-content-around mt-5 user-info">
                <div className="col-12 col-md-3">
                    <figure className="avatar avatar-profile">
                        <img
                            className="rounded-circle img-fluid"
                            src={user?.avatar ? user?.avatar.url : "https://cdn-icons-png.flaticon.com/512/3607/3607444.png"}
                            alt={user?.name}
                        />
                    </figure>
                </div>

                <div className="col-12 col-md-5">
                    <h4>ຊື່ ແລະ ນາມສະກຸນ</h4>
                    <p>{user?.name}</p>

                    <h4>ອີເມວ</h4>
                    <p>{user?.email}</p>

                    <h4>ວັນທີ່ລົງທະບຽນ</h4>
                    <p>{user?.createdAt?.substring(0, 10)}</p>
                </div>
            </div>
        </Userlayout>
        </>
    )
}

export default Profile;

 
