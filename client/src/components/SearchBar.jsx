// Search query input component
import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
    >
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search documents..."
        disabled={loading}
        style={{
          flex: 1,
          padding: '0.6rem 0.9rem',
          fontSize: '1rem',
          border: '1px solid #ccc',
          borderRadius: 4,
          outline: 'none',
        }}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        style={{
          padding: '0.6rem 1.2rem',
          fontSize: '1rem',
          borderRadius: 4,
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !query.trim() ? 0.6 : 1,
        }}
      >
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}