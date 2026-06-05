import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>OCR Document Search</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Upload an image or PDF to extract and search its text
      </p>
      <UploadForm onSuccess={() => navigate('/search')} />
      <button
        onClick={() => navigate('/search')}
        style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Go to Search →
      </button>
    </div>
  );
}
