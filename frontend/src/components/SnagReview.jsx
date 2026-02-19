import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSnagsByAudit, updateSnag, attachMediaToSnag, syncAuditToClickUp } from '../services/api';

export default function SnagReview() {
  const { auditId } = useParams();
  const [snags, setSnags] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [dragOverSnag, setDragOverSnag] = useState(null);

  useEffect(() => {
    getSnagsByAudit(auditId)
      .then(({ snags: s, media: m }) => {
        setSnags(s);
        setMedia(m || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [auditId]);

  const handleUpdate = async (id, updates) => {
    try {
      const updated = await updateSnag(id, updates);
      setSnags((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAttachMedia = async (snagId, mediaIds) => {
    try {
      await attachMediaToSnag(snagId, mediaIds);
      const { snags: s, media: m } = await getSnagsByAudit(auditId);
      setSnags(s);
      setMedia(m || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      const response = await syncAuditToClickUp(auditId);
      console.log('Sync response:', response);
      const { results } = response;
      
      if (results && results.length > 0) {
        const successCount = results.filter(r => r.status === 'created').length;
        const failedCount = results.filter(r => r.status === 'failed').length;
        const skippedCount = results.filter(r => r.status === 'skipped').length;
        
        let message = `Sync complete: ${successCount} created`;
        if (skippedCount > 0) message += `, ${skippedCount} skipped`;
        if (failedCount > 0) message += `, ${failedCount} failed`;
        
        // Show success message temporarily
        setError(`✅ ${message}`);
        setTimeout(() => setError(''), 5000);
      }
      
      const { snags: s } = await getSnagsByAudit(auditId);
      setSnags(s);
    } catch (err) {
      console.error('Sync error:', err);
      setError(`❌ Sync failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const getMediaForSnag = (snagId) => media.filter((m) => m.snag_id === snagId);
  const unassignedMedia = media.filter((m) => !m.snag_id);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ 
      maxWidth: 900, 
      width: '100%',
      margin: '0 auto',
      paddingBottom: '2rem'
    }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Review Snags</h1>

      {error && (
        <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', color: '#fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem', 
        flexWrap: 'wrap' 
      }}>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '1rem 1.5rem',
            background: syncing ? '#475569' : '#10b981',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontWeight: 600,
            opacity: syncing ? 0.7 : 1,
            fontSize: '1rem',
            minHeight: '48px',
            touchAction: 'manipulation',
            width: '100%',
          }}
        >
          {syncing ? '⏳ Syncing...' : '🔄 Sync All to ClickUp'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {snags.map((snag) => (
          <SnagCard
            key={snag.id}
            snag={snag}
            media={getMediaForSnag(snag.id)}
            unassignedMedia={unassignedMedia}
            isEditing={editingId === snag.id}
            isDragOver={dragOverSnag === snag.id}
            onEdit={() => setEditingId(snag.id)}
            onCancel={() => setEditingId(null)}
            onSave={(updates) => handleUpdate(snag.id, updates)}
            onAttachMedia={(mediaIds) => handleAttachMedia(snag.id, mediaIds)}
            onDragOver={() => setDragOverSnag(snag.id)}
            onDragLeave={() => setDragOverSnag(null)}
            onDrop={(mediaIds) => {
              handleAttachMedia(snag.id, mediaIds);
              setDragOverSnag(null);
            }}
          />
        ))}
      </div>

      {snags.length === 0 && <p style={{ color: '#64748b' }}>No snags extracted. Try again with a clearer recording.</p>}
    </div>
  );
}

function SnagCard({ snag, media, unassignedMedia, isEditing, isDragOver, onEdit, onCancel, onSave, onAttachMedia, onDragOver, onDragLeave, onDrop }) {
  const [form, setForm] = useState(snag);

  useEffect(() => {
    setForm(snag);
  }, [snag]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };


  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: '1rem',
        border: isDragOver ? '2px dashed #3b82f6' : '1px solid #334155',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        const ids = e.dataTransfer.getData('mediaIds');
        if (ids) onDrop(JSON.parse(ids));
      }}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
            <InputRow label="Description" value={form.snag_description} onChange={(v) => setForm((f) => ({ ...f, snag_description: v }))} />
            <InputRow label="Project" value={form.project_name} onChange={(v) => setForm((f) => ({ ...f, project_name: v }))} />
            <InputRow label="Trade" value={form.recommended_trade} onChange={(v) => setForm((f) => ({ ...f, recommended_trade: v }))} />
            <InputRow label="Builder" value={form.recommended_builder} onChange={(v) => setForm((f) => ({ ...f, recommended_builder: v }))} />
            <InputRow label="Deadline" value={form.deadline} onChange={(v) => setForm((f) => ({ ...f, deadline: v }))} />
            <InputRow label="Materials" value={form.materials_needed} onChange={(v) => setForm((f) => ({ ...f, materials_needed: v }))} />
            <InputRow label="Drawing ref" value={form.drawing_reference} onChange={(v) => setForm((f) => ({ ...f, drawing_reference: v }))} />
            <InputRow label="Notes" value={form.additional_notes} onChange={(v) => setForm((f) => ({ ...f, additional_notes: v }))} multiline />
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem',
            flexDirection: 'column'
          }}>
            <button 
              type="submit" 
              style={{
                ...btnStyle('#10b981'),
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                minHeight: '48px',
                touchAction: 'manipulation',
              }}
            >
              ✓ Save
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              style={{
                ...btnStyle('#64748b'),
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                minHeight: '48px',
                touchAction: 'manipulation',
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '1.05rem' }}>{snag.snag_description}</strong>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {snag.clickup_task_id && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', background: '#064e3b', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                  Synced
                </span>
              )}
              <button onClick={onEdit} style={{ ...btnStyle('#334155'), padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                Edit
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            {snag.project_name && <span>Project: {snag.project_name}</span>}
            {snag.recommended_trade && <span>| Trade: {snag.recommended_trade}</span>}
            {snag.deadline && <span>| Due: {snag.deadline}</span>}
          </div>
          {snag.materials_needed && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#94a3b8' }}>Materials: {snag.materials_needed}</p>}
        </>
      )}

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Attachments</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {media.map((m) => (
            <MediaThumb key={m.id} item={m} />
          ))}
          {unassignedMedia.length > 0 && (
            <select
              style={{ padding: '0.25rem', background: '#334155', borderRadius: 4, color: '#e2e8f0', fontSize: '0.875rem' }}
              onChange={(e) => {
                const ids = e.target.value ? [e.target.value] : [];
                if (ids.length) onAttachMedia(ids);
                e.target.value = '';
              }}
            >
              <option value="">+ Attach media</option>
              {unassignedMedia.map((m) => (
                <option key={m.id} value={m.id}>{m.file_name}</option>
              ))}
            </select>
          )}
        </div>
        {unassignedMedia.length > 0 && (
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Drag media here or use dropdown to attach
          </p>
        )}
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, multiline }) {
  const common = {
    width: '100%',
    padding: '0.5rem',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ ...common, minHeight: 60 }} />
      ) : (
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} style={common} />
      )}
    </div>
  );
}

function MediaThumb({ item }) {
  const url = item.url || null;
  const isImage = item.media_type === 'photo' && item.file_type?.startsWith('image/');
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('mediaIds', JSON.stringify([item.id]))}
      style={{
        width: 64,
        height: 64,
        borderRadius: 8,
        background: '#334155',
        overflow: 'hidden',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        color: '#94a3b8',
        textAlign: 'center',
      }}
    >
      {isImage && url ? (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        item.file_name?.slice(0, 8) || 'file'
      )}
    </div>
  );
}

function btnStyle(bg) {
  return {
    padding: '0.5rem 1rem',
    background: bg,
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    touchAction: 'manipulation',
  };
}
