// หน้าสำหรับ Admin/Manage Blog
import React, { useState, useEffect } from 'react';
import { useCreateBlogMutation, useUpdateBlogMutation, useDeleteBlogMutation } from '../redux/api/blogApi';

const BlogAdmin = () => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'tech',
    image: '',
    author: '',
    tags: []
  });

  // Rich Text Editor component
  const [content, setContent] = useState('');
  
  return (
    <div className="blog-admin">
      <h2>📝 จัดการบทความ</h2>
      
      {/* Form สร้าง/แก้ไขบทความ */}
      <div className="blog-form">
        <input 
          type="text" 
          placeholder="หัวข้อบทความ"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        
        <textarea 
          placeholder="คำอธิบายสั้น"
          value={formData.excerpt}
          onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
        />
        
        {/* Rich Text Editor สำหรับเนื้อหา */}
        <div className="content-editor">
          <ReactQuill 
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="เขียนเนื้อหาบทความ..."
          />
        </div>
        
        <select 
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="tech">เทคโนโลยี</option>
          <option value="review">รีวิว</option>
          <option value="guide">คู่มือ</option>
          <option value="news">ข่าวสาร</option>
        </select>
        
        <input 
          type="text" 
          placeholder="ลิงก์รูปภาพ"
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
        />
        
        <button className="submit-btn">บันทึกบทความ</button>
      </div>
    </div>
  );
};