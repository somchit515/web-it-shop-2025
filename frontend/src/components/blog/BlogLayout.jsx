// src/components/blog/BlogLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import BlogFooter from './BlogFooter';

const BlogLayout = () => {
  return (
    <div className="blog-layout">
      <BlogHeader />
      <main className="blog-main">
        <Outlet />
      </main>
      <BlogFooter />
    </div>
  );
};

export default BlogLayout;