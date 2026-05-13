// src/components/blog/BlogLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';



const BlogLayout = () => {
  return (
    <div className="blog-layout">
    
      <main className="blog-main">
        <Outlet />
      </main>
     
    </div>
  );
};

export default BlogLayout;