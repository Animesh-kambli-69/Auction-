import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Page not found.</p>
      <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Return Home</Link>
    </div>
  );
}
