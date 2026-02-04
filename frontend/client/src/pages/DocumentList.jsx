// frontend/client/src/pages/DocumentList.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function DocumentList() {
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

  if (loading) {
    return (
      <div className="text-center mt-lg">
        <span className="loading"></span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center mt-lg">
        <h1>Welcome to DevDocs</h1>
        <p className="text-muted mt-md">No documents available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="document-header">
        <h1>Welcome to DevDocs</h1>
        <p className="text-muted">
          Select a document from the sidebar to start reading, or browse all documents below.
        </p>
      </div>

      <div className="document-body">
        <h2 className="mb-lg">All Documents</h2>
        
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {documents.map((doc) => (
            <Link
              key={doc.id}
              to={`/docs/${doc.slug}`}
              className="card"
              style={{ textDecoration: 'none', transition: 'all var(--transition)' }}
            >
              <h3 className="mb-sm">{doc.title}</h3>
              <div className="flex items-center gap-lg text-muted" style={{ fontSize: '1.4rem' }}>
                <span>By {doc.author_username}</span>
                <span>❤️ {doc.likes_count}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}