// Full document view page
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, deleteDocument } from '../api/index';
import DocumentViewer from '../components/DocumentViewer';

export default function Document() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getDocument(id);
        setDocument(data);
        setStatus('ready');
      } catch (err) {
        setError(err.response?.data?.message ?? 'Could not load document.');
        setStatus('error');
      }
    }
    load();
  }, [id]);

  async function handleDelete(docId) {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try {
      await deleteDocument(docId);
      navigate('/search');
    } catch (err) {
      alert('Delete failed. Please try again.');
    }
  }

  if (status === 'loading') {
    return <p style={{ padding: '2rem' }}>Loading document…</p>;
  }

  if (status === 'error') {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/search')}>Back to Search</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <DocumentViewer document={document} onDelete={handleDelete} />
    </div>
  );
}