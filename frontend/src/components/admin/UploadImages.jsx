import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// import Loader from '../layout/Loader'; 
import AdminLayout from '../layout/AdminLayout'; // 
import {
    useGetProductDetailsQuery,
    useUploadProductImagesMutation,
    useDeleteProductImageMutation
} from '../redux/api/productsApi';
import { confirmDialog } from './_shared/confirmDialog';

function UploadImages() {

    const params = useParams()
    const navigate = useNavigate()
    
    // 1. State สำหรับ Base64 URL ภาพตัวอย่างใหม่ (ที่จะส่งไป Backend)
    const [imagesPreview, setImagesPreview] = useState ([]); 
    // 2. State สำหรับ URL ภาพທີ່ອັບໂຫຼດແລ້ວ (ຈາກ Backend)
    const [uploadedImages, setUploadedImages] = useState ([]);

    // Mutations สำหรับการอัปโหลดและลบ
    const [uploadProductImages, { isLoading, error, isSuccess }] = useUploadProductImagesMutation();
    const [
        deleteProductImage, 
        { 
            isLoading: isDeleteLoading, 
            error: deleteError, 
            isSuccess: isDeleteSuccess 
        }
    ] = useDeleteProductImageMutation();

    // ดึงสถานะการโหลดของ Query มาใช้ด้วย
    const { data, refetch,  } = useGetProductDetailsQuery(params?.id); 

    useEffect(() => {
        // อัปเดตรายการภาพที่อัปโหลดแล้ว เมื่อข้อมูลสินค้าถูกโหลด
        if (data?.product) {
            setUploadedImages(data?.product?.images)
        }
        
        // 💡 จัดการ Error และ Success จากการอัปโหลด/ลบ
        if (error) {
            toast.error(error?.data?.message || "ການອັບໂຫຼດລົ້ມເຫຼວ"); 
        }

        if (isSuccess) {
            setImagesPreview([])
            toast.success("ອັບໂຫຼດຮູບພາບສຳເຫຼັດ")
            refetch(); 
        }

        if (deleteError) {
            toast.error(deleteError?.data?.message || "ການລຶບຮູບພາບລົ້ມເຫຼວ");
        }

        if (isDeleteSuccess) {
            toast.success("ລຶບຮູບພາບສຳເຫຼັດ");
            refetch(); 
        }

    }, [data, error, isSuccess, navigate, deleteError, isDeleteSuccess, refetch])


    const onChange = (e) => {
        const files = Array.from(e.target.files)

        // 1. เคลียร์สถานะเดิมและสร้าง Promise สำหรับแต่ละไฟล์
        setImagesPreview([]); 

        const fileReads = files.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                    if (reader.readyState === 2) { 
                        resolve(reader.result); // Resolve ด้วย Base64 string
                    }
                }
                
                reader.onerror = (error) => reject(error);
                
                // 🛑 ให้อ่านไฟล์เป็น Base64 Data URL
                reader.readAsDataURL(file); 
            });
        });

        // 2. รอให้ทุก Promise เสร็จสิ้น แล้วອັບເດດ state เพียงครั้งດຽວ
        Promise.all(fileReads)
            .then(base64Images => {
                setImagesPreview(base64Images);
            })
            .catch(error => {
                console.error("Error reading files:", error);
                toast.error("ຂໍອະໄພ, ບໍ່ສາມາດອ່ານຮູບພາບທີ່ທ່ານເລືອກໄດ້.");
            });

        // 3. ເຄລຍ input element ຫຼັງຈາກເລືອກໄຟລ໌
        e.target.value = null; 
    }


    const submitHandler = (e) => {
        e.preventDefault();
        
        if (imagesPreview.length === 0) {
            return toast.error("ກະລຸນາເລືອກຮູບພາບເພື່ອອັບໂຫຼດ");
        }

        // ສົ່ງ imagesPreview (Array of Base64 strings) ໄປຍັງ Backend
        uploadProductImages({ id: params?.id, body: { images: imagesPreview } }) 
    };

    
    // 💡 ຟັງຊັນສຳລັບການລຶບພາບຕົວຢ່າງທີ່ເລືອກ (Base64)
    const handleImagePreviewDelete = (index) => {
        setImagesPreview(prev => prev.filter((img, i) => i !== index));
    }

    // 💡 ຟັງຊັນສຳລັບການລຶບພາບที่ອັບໂຫຼດແລ້ວ (เรียก API)
    const handleUploadedImageDelete = async (public_id) => {
        const ok = await confirmDialog.show({
            title: 'ລຶບຮູບພາບ?',
            message: 'ຮູບນີ້ຈະຫາຍຖາວອນຈາກ cloud storage',
            confirmText: 'ລຶບເລີຍ',
            variant: 'danger',
            icon: 'fa-image',
        });
        if (!ok) return;
        deleteProductImage({
            id: params?.id,
            body: { public_id }
        });
    }
    
    const isOperationLoading = isLoading || isDeleteLoading;

    // if (isDetailsLoading) return <Loader />; // 💡 ຄວນເພີ່ມ Loader ຖ້າ isDetailsLoading ເປັນ true

    return (
        <AdminLayout>
            <div className="row wrapper">
                <div className="col-10 col-lg-8 mt-5 mt-lg-0">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler}>
                        <h2 className="mb-4">ອັບໂຫຼດຮູບພາບສິນຄ້າ</h2>

                        <div className="mb-3">
                            <label htmlFor="customFile" className="form-label">ເລືອກຮູບພາບ</label>

                            <div className="custom-file">
                                <input
                                    type="file"
                                    name="product_images"
                                    className="form-control"
                                    id="customFile"
                                    multiple
                                    onChange={onChange}
                                />
                            </div>

                            {/* ສ່ວນສະແດງພາບໃໝ່ທີ່ເລືອກ (New Images) */}
                            {imagesPreview.length > 0 && (
                                <div className="new-images my-4">
                                    <p className="text-warning">ຮູບພາບໃໝ່ທີ່ເລືອກ:</p>
                                    <div className="row mt-4">
                                        {imagesPreview.map((img, index) => (
                                            <div className="col-md-3 mt-2" key={`preview-${index}`}>
                                                <div className="card">
                                                    <img
                                                        src={img} 
                                                        alt="ຮູບພາບສິນຄ້າໃໝ່" 
                                                        className="card-img-top p-2"
                                                        style={{ width: '100%', height: '80px', objectFit: 'cover' }} 
                                                    />
                                                    <button
                                                        style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                                                        type="button"
                                                        className="btn btn-block btn-danger cross-button mt-1 py-0"
                                                        onClick={() => handleImagePreviewDelete(index)}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ສ່ວນສະແດງພາບທີ່ອັບໂຫຼດແລ້ວ (Uploaded Images) */}
                            {uploadedImages?.length > 0 && (
                                <div className="uploaded-images my-4">
                                    <p className="text-success">ຮູບພາບສິນຄ້າທີ່ໄດ້ອັບໂຫຼດແລ້ວ:</p>
                                    <div className="row mt-1">
                                        {uploadedImages.map((img) => (
                                            <div className="col-md-3 mt-2" key={img.public_id || img.url}>
                                                <div className="card">
                                                    <img
                                                        src={img?.url} 
                                                        alt="ຮູບພາບສິນຄ້າປັດຈຸບັນ"
                                                        className="card-img-top p-2"
                                                        style={{ width: '100%', height: '80px', objectFit: 'cover' }} 
                                                    />
                                                    <button
                                                        style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                                                        className="btn btn-block btn-danger cross-button mt-1 py-0"
                                                        type="button"
                                                        onClick={() => handleUploadedImageDelete(img?.public_id)} 
                                                        disabled={isOperationLoading} 
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button id="register_button" type="submit" className="btn w-100 py-2" disabled={imagesPreview.length === 0 || isOperationLoading}>
                            {isOperationLoading ? "ກຳລັງອັບໂຫຼດ..." : "ອັບໂຫຼດ"}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}

export default UploadImages;