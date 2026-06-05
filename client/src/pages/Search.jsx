import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import { searchDocuments } from '../api/index';

const PAGE_SIZE = 10;

export default function Search() {
  const navigate = useNavigate();
  const [hits, setHits] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  async function handleSearch(q, pageIndex = 0) {
    setLoading(true);
    setError('');
    setQuery(q);
    setPage(pageIndex);

    try {
      const data = await searchDocuments(q, pageIndex * PAGE_SIZE, PAGE_SIZE);
      setHits(data.hits);
      setTotal(data.total);
    } catch (err) {
      setError('Search failed. Is Elasticsearch running?');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = total !== null ? Math.ceil(total / PAGE_SIZE) : 0;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 2rem' }}>

      {/* Header row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          Search Documents
        </h1>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
            transition: 'transform 0.1s, box-shadow 0.1s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(37,99,235,0.35)';
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span>
          Upload New
        </button>
      </div>

      <SearchBar onSearch={(q) => handleSearch(q, 0)} loading={loading} />

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      {total !== null && (
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {total} result{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {hits.map(hit => (
        <ResultCard key={hit._id} hit={hit} />
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
          <button
            disabled={page === 0}
            onClick={() => handleSearch(query, page - 1)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: page === 0 ? '#f3f4f6' : '#fff',
              color: page === 0 ? '#9ca3af' : '#374151',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            ← Prev
          </button>
          <span style={{ padding: '0.45rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => handleSearch(query, page + 1)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: page + 1 >= totalPages ? '#f3f4f6' : '#fff',
              color: page + 1 >= totalPages ? '#9ca3af' : '#374151',
              cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
