import { useNavigate } from 'react-router-dom';

export default function ResultCard({ hit }) {
  const navigate = useNavigate();

  const snippet = hit.highlight?.ocrText?.[0] ?? hit._source.ocrText.slice(0, 200);

  return (
    <div
      onClick={() => navigate(`/document/${hit._id}`)}
      style={{
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: '1rem',
        marginBottom: '0.75rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '1rem' }}>{hit._source.filename}</strong>
        <span style={{ fontSize: '0.75rem', color: '#888' }}>
          Score: {hit._score.toFixed(2)}
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '0.25rem 0 0.5rem' }}>
        {new Date(hit._source.uploadedAt).toLocaleString()}
      </p>

      <p
        style={{ fontSize: '0.9rem', color: '#444', margin: 0 }}
        dangerouslySetInnerHTML={{ __html: snippet + '…' }}
      />
    </div>
  );
}