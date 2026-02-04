// frontend/client/src/components/Layout.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="app">
        <header className="header">
          <div className="flex items-center gap-md">
            <button
              className="btn btn-icon btn-ghost md-hide"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <Link to="/" className="logo">
              DevDocs
            </Link>
          </div>

          <nav className="header-nav">
            {isAdmin && (
              <Link to="/admin" className="btn btn-sm btn-ghost">
                Admin
              </Link>
            )}
            <span className="text-muted">
              {user?.username}
            </span>
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">
              Logout
            </button>
          </nav>
        </header>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}