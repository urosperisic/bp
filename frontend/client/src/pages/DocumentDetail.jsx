// frontend/client/src/pages/DocumentDetail.jsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CodeBlock from '../components/CodeBlock';

export default function DocumentDetail() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [slug]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/docs/documents/${slug}/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else {
        setError('Document not found');
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    
    setLiking(true);
    try {
      const response = await fetch(`/api/docs/documents/${document.slug}/like/`, { 
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh document to get updated like count
        await fetchDocument();
        window.dispatchEvent(new Event('documentsUpdated'));
      }
    } catch (error) {
      console.error('Failed to like document:', error);
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-lg">
        <span className="loading"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-lg">
        <h1>{error}</h1>
        <Link to="/" className="btn btn-primary mt-md">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!document) return null;

  return (
    <article>
      <div className="document-header">
        <h1 className="document-title">{document.title}</h1>
        
        <div className="document-meta">
          <span>By {document.author_username}</span>
          <span>{new Date(document.created_at).toLocaleDateString()}</span>
          <span>💙 {document.likes_count}</span>
        </div>

        <div className="document-actions">
          <button
            onClick={handleLike}
            className={`btn ${document.is_liked ? 'btn-primary' : 'btn-secondary'}`}
            disabled={liking}
          >
            {liking ? (
              <span className="loading"></span>
            ) : (
              <>
                {document.is_liked ? '🤍  Liked' : '🩵 Like'}
              </>
            )}
          </button>

          {isAdmin && (
            <Link
              to={`/admin/docs/${document.slug}/edit`}
              className="btn btn-secondary"
            >
              🖊️ Edit
            </Link>
          )}
        </div>
      </div>

      <div className="document-body">
        {document.blocks && document.blocks.length > 0 ? (
          document.blocks.map((block) => (
            <div key={block.id} className="block">
              {block.block_type === 'text' ? (
                <div 
                  className="block-text"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              ) : (
                <CodeBlock
                  code={block.content}
                  language={block.language || 'plaintext'}
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-muted">No content available.</p>
        )}
      </div>
    </article>
  );
}