// src/components/layout/MetaData.jsx
import React from 'react';
import { Helmet } from 'react-helmet';

function MetaData({
  title = 'ITHUBB',
  description = 'ITHUBB — ຮ້ານ IT HUBB',
  logoPath = '/images/logo.png',
  url = window.location.href, // เพิ่ม URL อัตโนมัติ
}) {
  const fullTitle = title ? `${title} - ITHUBB` : 'ITHUBB';

  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{fullTitle}</title>

      {/* Basic Meta */}
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href={logoPath} />
      <link rel="icon" type="image/png" sizes="16x16" href={logoPath} />
      <link rel="apple-touch-icon" href={logoPath} />
      <link rel="icon" href="/favicon.ico" /> {/* เพิ่มรองรับ .ico */}
      <meta name="theme-color" content="#0f1720" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={logoPath} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ITHUBB" />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={logoPath} />
    </Helmet>
  );
}

export default MetaData;
