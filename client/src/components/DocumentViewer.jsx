import { useState } from 'react';

export default function DocumentViewer({ document, onDelete }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(document.ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>

      {/* Left — file preview */}
      <div style={{ flex: 1 }}>
        <h3>{document.filename}</h3>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>
          Uploaded: {new Date(document.uploadedAt).toLocaleString()} &nbsp;|&nbsp;
          Confidence: {document.confidence.toFixed(1)}%
        </p>

        {document.mimeType?.startsWith('image/') ? (
          <img
            src={`http://localhost:3001/uploads/${document.filename}`}
            alt={document.filename}
            style={{ maxWidth: '100%', border: '1px solid #ddd', borderRadius: 4 }}
          />
        ) : (
          <embed
            src={`http://localhost:3001/uploads/${document.filename}`}
            type="application/pdf"
            width="100%"
            height="600px"
          />
        )}
      </div>

      {/* Right — extracted text */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Extracted Text</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => onDelete(document.id)}
              style={{ color: 'red' }}
            >
              Delete
            </button>
          </div>
        </div>

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: 4,
            maxHeight: '600px',
            overflowY: 'auto',
            fontSize: '0.9rem',
          }}
        >
          {document.ocrText}
        </pre>
      </div>

    </div>
  );
}