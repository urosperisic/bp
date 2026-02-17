// src/pages/admin/AdminDocumentEdit.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

export default function AdminDocumentEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isNew = !slug;

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchDocument();
    }
  }, [slug]);

  const fetchDocument = async () => {
    try {
      const response = await apiRequest(`/api/docs/documents/${slug}/`, {
        method: 'GET',
      });
      
      if (response && response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setIsPublished(data.is_published);
        setBlocks(data.blocks || []);
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);

    try {
      const docResponse = await apiRequest(
        isNew ? '/api/docs/documents/' : `/api/docs/documents/${slug}/`,
        {
          method: isNew ? 'POST' : 'PUT',
          body: JSON.stringify({ title, is_published: isPublished }),
        }
      );

      if (!docResponse || !docResponse.ok) {
        throw new Error('Failed to save document');
      }

      const docData = await docResponse.json();
      const docId = docData.id;

      const blocksPayload = blocks.map((block, index) => ({
        block_type: block.block_type,
        content: block.content,
        language: block.language || '',
        order: index,
      }));

      await apiRequest(`/api/docs/documents/${docId}/blocks/bulk/`, {
        method: 'POST',
        body: JSON.stringify({ blocks: blocksPayload }),
      });

      navigate('/admin');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type) => {
    setBlocks([
      ...blocks,
      {
        id: Date.now(),
        block_type: type,
        content: '',
        language: type === 'code' ? 'javascript' : '',
        order: blocks.length,
      },
    ]);
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    setBlocks(newBlocks);
  };

  const deleteBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
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
        <h1>{isNew ? 'New Document' : 'Edit Document'}</h1>
      </div>

      <div className="document-body">
        <div className="card mb-lg">
          <div className="form-group">
            <label htmlFor="doc-title" className="form-label">
              Title
            </label>
            <input
              id="doc-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>

          <div className="form-group">
            <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>Published</span>
            </label>
          </div>
        </div>

        <div className="mb-lg">
          <div className="flex items-center justify-between mb-md">
            <h2>Blocks</h2>
            <div className="flex gap-sm">
              <button onClick={() => addBlock('text')} className="btn btn-sm btn-secondary">
                + Text Block
              </button>
              <button onClick={() => addBlock('code')} className="btn btn-sm btn-secondary">
                + Code Block
              </button>
            </div>
          </div>

          {blocks.length === 0 ? (
            <div className="card text-center text-muted">
              No blocks yet. Add text or code blocks above.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {blocks.map((block, index) => (
                <div key={block.id} className="card">
                  <div className="flex items-center justify-between mb-md">
                    <strong style={{ textTransform: 'uppercase', fontSize: '1.2rem' }}>
                      {block.block_type} Block
                    </strong>
                    <div className="flex gap-sm">
                      <button
                        onClick={() => moveBlock(index, 'up')}
                        className="btn btn-sm btn-icon btn-ghost"
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveBlock(index, 'down')}
                        className="btn btn-sm btn-icon btn-ghost"
                        disabled={index === blocks.length - 1}
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteBlock(index)}
                        className="btn btn-sm btn-icon btn-ghost"
                        style={{ color: 'var(--c-error)' }}
                        aria-label="Delete block"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {block.block_type === 'code' && (
                    <div className="form-group">
                      <label htmlFor={`block-lang-${block.id}`} className="form-label">
                        Language
                      </label>
                      <select
                        id={`block-lang-${block.id}`}
                        className="form-select"
                        value={block.language}
                        onChange={(e) => updateBlock(index, 'language', e.target.value)}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                        <option value="json">JSON</option>
                        <option value="plaintext">Plain Text</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor={`block-content-${block.id}`} className="form-label">
                      Content
                    </label>
                    <textarea
                      id={`block-content-${block.id}`}
                      className="form-textarea"
                      value={block.content}
                      onChange={(e) => updateBlock(index, 'content', e.target.value)}
                      placeholder={
                        block.block_type === 'text'
                          ? 'Enter text content (HTML supported)'
                          : 'Enter code...'
                      }
                      style={{ minHeight: block.block_type === 'code' ? '20rem' : '12rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-md">
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? <span className="loading"></span> : '💾 Save Document'}
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}