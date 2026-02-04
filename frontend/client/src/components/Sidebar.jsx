// frontend/client/src/components/Sidebar.jsx

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    fetchDocuments();
    window.addEventListener('documentsUpdated', fetchDocuments);
    return () => window.removeEventListener('documentsUpdated', fetchDocuments);
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

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Documentation</h2>
        
        <label htmlFor="doc-search" className="visually-hidden">
          Search documents
        </label>
        <input
          id="doc-search"
          type="search"
          className="search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search documents"
        />
      </div>

      {loading ? (
        <div className="text-center mt-lg">
          <span className="loading"></span>
        </div>
      ) : (
        <nav aria-label="Documents navigation">
          <ul className="doc-list">
            {filteredDocs.length === 0 ? (
              <li className="text-muted text-center mt-lg">
                No documents found
              </li>
            ) : (
              filteredDocs.map((doc) => (
                <li key={doc.id} className="doc-item">
                  <Link
                    to={`/docs/${doc.slug}`}
                    className={`doc-link ${slug === doc.slug ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    {doc.title}
                    <span className="text-muted" style={{ fontSize: '1.2rem', marginLeft: '0.8rem' }}>
                      ❤️ {doc.likes_count}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>
      )}
    </aside>
  );
}