import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVoice, uploadMedia, uploadSnagText } from '../services/api';
import MediaUpload from './MediaUpload';

export default function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [snagText, setSnagText] = useState('');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      setUploadedFile(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);
      setError('');
    } catch (err) {
      setError('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      chunksRef.current = [];
    }
    e.target.value = '';
  };

  const handleTextFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = typeof event.target?.result === 'string' ? event.target.result : '';
        setSnagText(text);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setError('');
    try {
      const hasText = snagText.trim().length > 0;
      let result;

      if (uploadedFile || chunksRef.current.length > 0) {
        let file = null;

        if (uploadedFile) {
          file = uploadedFile;
        } else if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        }

        if (!file) {
          setError('Please record or upload an audio file, or provide text describing the snags');
          setProcessing(false);
          return;
        }

        result = await uploadVoice(file, undefined, projectName || undefined);
      } else if (hasText) {
        result = await uploadSnagText(snagText, projectName || undefined);
      } else {
        setError('Please record/upload audio or paste/upload text describing the snags');
        setProcessing(false);
        return;
      }

      let auditId = result.auditId;

      if (mediaFiles.length > 0) {
        const mediaResult = await uploadMedia(mediaFiles, auditId);
        auditId = mediaResult.auditId;
      }

      navigate(`/review/${auditId}`);
    } catch (err) {
      setError(err.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: 600, 
      width: '100%',
      margin: '0 auto',
      paddingBottom: '2rem'
    }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>New Snag Audit</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
          Project Name (optional)
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Smith Street Refurb"
          style={{
            width: '100%',
            padding: '0.5rem',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e2e8f0',
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>
          Record your voice or upload an audio file describing the snags
        </p>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'stretch'
        }}>
          {!recording ? (
            <button
              onClick={startRecording}
              style={{
                padding: '1rem 1.5rem',
                background: '#10b981',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: '48px',
                touchAction: 'manipulation',
              }}
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              style={{
                padding: '1rem 1.5rem',
                background: '#ef4444',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: '48px',
                touchAction: 'manipulation',
                animation: 'pulse 2s infinite',
              }}
            >
              ⏹ Stop Recording
            </button>
          )}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem',
            margin: '0.5rem 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          </div>
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
            📁 Upload Audio File
            <input
              type="file"
              accept=".mp3,.wav,.webm,.m4a,.mp4"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
        </div>
        {uploadedFile && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Selected: {uploadedFile.name}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>
          Or paste snag details / ChatGPT output (tables or text)
        </p>
        <textarea
          value={snagText}
          onChange={(e) => setSnagText(e.target.value)}
          placeholder="Paste a list or table of snags here. Each row or bullet should describe one snag, including trade, deadline, materials, etc. if available."
          style={{
            width: '100%',
            minHeight: 120,
            padding: '0.5rem',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e2e8f0',
            fontSize: '0.875rem',
          }}
        />
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label
            style={{
              padding: '0.5rem 1rem',
              background: '#334155',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#e2e8f0',
              fontSize: '0.875rem',
            }}
          >
            Upload text file
            <input
              type="file"
              accept=".txt,.md,.csv"
              style={{ display: 'none' }}
              onChange={handleTextFileSelect}
            />
          </label>
          {snagText && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Text length: {snagText.length.toLocaleString()} characters
            </span>
          )}
        </div>
      </div>

      <MediaUpload onFilesChange={setMediaFiles} />

      {error && (
        <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', color: '#fecaca' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={processing}
        style={{
          padding: '1rem 1.5rem',
          background: processing ? '#475569' : '#3b82f6',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontWeight: 600,
          opacity: processing ? 0.7 : 1,
          fontSize: '1rem',
          width: '100%',
          minHeight: '48px',
          touchAction: 'manipulation',
          marginTop: '1rem',
        }}
      >
        {processing ? '⏳ Processing...' : '✨ Process & Extract Snags'}
      </button>
    </div>
  );
}
