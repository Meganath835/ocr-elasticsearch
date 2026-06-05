// Drag-and-drop file upload component
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api/index';

const ACCEPTED_TYPES = {
  'image/png': [],
  'image/jpeg': [],
  'image/tiff': [],
  'application/pdf': [],
};

export default function UploadForm({ onSuccess }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    const file = acceptedFiles[0];
    setStatus('uploading');
    setProgress(0);
    setError('');
    setResult(null);

    try {
      const data = await uploadFile(file, setProgress);
      setResult(data);
      setStatus('done');
      if (onSuccess) onSuccess(data);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? `[${d.step ?? 'error'}] ${d.message}` : 'Upload failed. Please try again.');
      setStatus('error');
    }
  }, [onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: status === 'uploading',
  });

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? '#2563eb' : '#ccc'}`,
          borderRadius: 8,
          padding: '2.5rem',
          textAlign: 'center',
          background: isDragActive ? '#eff6ff' : '#fafafa',
          cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
          transition: 'border 0.2s, background 0.2s',
        }}
      >
        <input {...getInputProps()} />
        <p style={{ margin: 0, color: '#555', fontSize: '0.95rem' }}>
          {isDragActive
            ? 'Drop the file here…'
            : 'Drag & drop an image or PDF, or click to select'}
        </p>
        <p style={{ margin: '0.4rem 0 0', color: '#aaa', fontSize: '0.8rem' }}>
          PNG, JPG, TIFF, PDF — max 20 MB
        </p>
      </div>

      {/* Progress bar */}
      {status === 'uploading' && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
            <span>Processing OCR…</span>
            <span>{progress}%</span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: 4, height: 8 }}>
            <div
              style={{
                width: `${progress}%`,
                background: '#2563eb',
                height: '100%',
                borderRadius: 4,
                transition: 'width 0.2s',
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <p style={{ marginTop: '1rem', color: 'red', fontSize: '0.9rem' }}>{error}</p>
      )}

      {/* Success preview */}
      {status === 'done' && result && (
        <div style={{ marginTop: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '1rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontWeight: 600, color: '#166534' }}>
            OCR complete — {result.filename}
          </p>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#888' }}>
            Confidence: {result.confidence.toFixed(1)}%
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '0.85rem',
              maxHeight: 200,
              overflowY: 'auto',
              background: '#fff',
              padding: '0.75rem',
              borderRadius: 4,
              border: '1px solid #d1fae5',
              margin: 0,
            }}
          >
            {result.ocrText}
          </pre>
        </div>
      )}

    </div>
  );
}