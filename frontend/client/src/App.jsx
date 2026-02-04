// frontend/client/src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DocumentList from './pages/DocumentList';
import DocumentDetail from './pages/DocumentDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDocumentEdit from './pages/admin/AdminDocumentEdit';

// Layout
import Layout from './components/Layout';

// Protected Route Components
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container"><span className="loading"></span></div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container"><span className="loading"></span></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/docs/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <DocumentDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/docs/new"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDocumentEdit />
                </Layout>
              </AdminRoute>
            }
          />
          
          <Route
            path="/admin/docs/:slug/edit"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDocumentEdit />
                </Layout>
              </AdminRoute>
            }
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;