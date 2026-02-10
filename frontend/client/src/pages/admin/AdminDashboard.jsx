// frontend/client/src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/docs/documents/', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/docs/documents/${slug}/`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.slug !== slug));
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const handleTogglePublish = async (slug, currentStatus) => {
    try {
      const response = await fetch(`/api/docs/documents/${slug}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_published: !currentStatus }),
      });

      if (response.ok) {
        setDocuments(documents.map(doc => 
          doc.slug === slug ? { ...doc, is_published: !currentStatus } : doc
        ));
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-lg">
        <span className="loading"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="document-header">
        <div className="flex items-center justify-between">
          <h1>Admin Dashboard</h1>
          <Link to="/admin/docs/new" className="btn btn-primary">
            + New Document
          </Link>
        </div>
      </div>

      <div className="document-body">
        {documents.length === 0 ? (
          <div className="text-center text-muted">
            <p>No documents yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {documents.map((doc) => (
              <div key={doc.id} className="card">
                <div className="flex items-center justify-between">
                  <div style={{ flex: 1 }}>
                    <h2 className="mb-sm">{doc.title}</h2>
                    <div className="flex items-center gap-lg text-muted" style={{ fontSize: '1.4rem' }}>
                      <span>By {doc.author_username}</span>
                      <span>💙 {doc.likes_count}</span>
                      <span className={doc.is_published ? 'text-success' : 'text-error'}>
                        {doc.is_published ? '✓ Published' : '✗ Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-sm">
                    <Link
                      to={`/admin/docs/${doc.slug}/edit`}
                      className="btn btn-sm btn-secondary"
                    >
                      🖊️ Edit
                    </Link>
                    
                    <button
                      onClick={() => handleTogglePublish(doc.slug, doc.is_published)}
                      className="btn btn-sm btn-secondary"
                    >
                      {doc.is_published ? '👁️ Unpublish' : '👁️ Publish'}
                    </button>

                    <button
                      onClick={() => handleDelete(doc.slug, doc.title)}
                      className="btn btn-sm btn-secondary"
                      style={{ color: 'var(--c-error)' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}