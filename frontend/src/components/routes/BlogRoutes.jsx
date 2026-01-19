// src/routes/BlogRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import BlogList from '../../components/blog/BlogList';
import BlogDetail from '../../components/blog/BlogDetail';
import ProtectedRoute from '../blog/ProtectedRoute';
import BlogLayout from '../blog/BlogLayout';

const useBlogRoutes = () => {
  return [
    // Public Blog Routes
    <Route key="blog-layout" path="/blogs" element={<BlogLayout />}>
      <Route key="blog-list" index element={<BlogList />} />
      <Route key="blog-detail" path=":id" element={<BlogDetail />} />
      <Route key="blog-category" path="category/:category" element={<BlogList />} />
      <Route key="blog-search" path="search" element={<BlogList />} />
    </Route>,

    // Admin Blog Routes - แก้โดยไม่ใช้ JSX comments ใน array
  
  ];
};

export default useBlogRoutes;