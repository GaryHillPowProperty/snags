import { useRef } from 'react';

export default function MediaUpload({ onFilesChange }) {
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    onFilesChange?.(files);
    e.target.value = '';
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute('capture', 'environment');
      cameraInputRef.current.click();
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
        Add photos, videos, or technical drawings (optional)
      </p>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {/* Mobile camera button */}
        <label
          style={{
            padding: '1rem 1.5rem',
            background: '#3b82f6',
            borderRadius: 12,
            cursor: 'pointer',
            color: '#fff',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: 500,
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
          }}
        >
          📷 Take Photo/Video
          <input
            ref={cameraInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </label>
        
        {/* File picker button */}
        <label
          style={{
            padding: '1rem 1.5rem',
            background: '#334155',
            borderRadius: 12,
            cursor: 'pointer',
            color: '#e2e8f0',
            textAlign: 'center',
            fontSize: '1rem',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
          }}
        >
          📁 Choose Files
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.heic,.webp,.mp4,.mov,.webm,.pdf"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
}
