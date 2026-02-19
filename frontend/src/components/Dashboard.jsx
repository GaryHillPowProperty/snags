import { useState, useEffect, useCallback } from 'react';
import { getSnags, updateSnag, syncSnagToClickUp } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [snags, setSnags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ project: '', status: '', trade: '' });
  const [projects, setProjects] = useState([]);
  const [trades, setTrades] = useState([]);

  const fetchSnags = useCallback(() => {
    setLoading(true);
    setError('');
    getSnags(filters)
      .then((data) => {
        setSnags(data);
        const projs = [...new Set(data.map((s) => s.project_name).filter(Boolean))].sort();
        const trds = [...new Set(data.map((s) => s.recommended_trade).filter(Boolean))].sort();
        setProjects(projs);
        setTrades(trds);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters.project, filters.status, filters.trade]);

  useEffect(() => {
    fetchSnags();
  }, [fetchSnags]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateSnag(id, { status });
      setSnags((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSync = async (id) => {
    try {
      await syncSnagToClickUp(id);
      fetchSnags();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusOptions = ['new', 'in progress', 'completed'];

  return (
    <div style={{ 
      width: '100%',
      paddingBottom: '2rem',
      overflowX: 'auto'
    }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Snag Dashboard</h1>

      {error && (
        <div style={{ padding: '0.75rem', background: '#7f1d1d', borderRadius: 8, marginBottom: '1rem', color: '#fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem', 
        marginBottom: '1.5rem'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            color: '#94a3b8', 
            marginBottom: '0.5rem',
            fontWeight: 500
          }}>
            Project
          </label>
          <select
            value={filters.project}
            onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))}
            style={{
              ...selectStyle,
              width: '100%',
              fontSize: '1rem',
              minHeight: '48px',
            }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            color: '#94a3b8', 
            marginBottom: '0.5rem',
            fontWeight: 500
          }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            style={{
              ...selectStyle,
              width: '100%',
              fontSize: '1rem',
              minHeight: '48px',
            }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            color: '#94a3b8', 
            marginBottom: '0.5rem',
            fontWeight: 500
          }}>
            Trade
          </label>
          <select
            value={filters.trade}
            onChange={(e) => setFilters((f) => ({ ...f, trade: e.target.value }))}
            style={{
              ...selectStyle,
              width: '100%',
              fontSize: '1rem',
              minHeight: '48px',
            }}
          >
            <option value="">All Trades</option>
            {trades.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading...</p>
      ) : (
        <div style={{ 
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '-webkit-overflow-scrolling': 'touch'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            fontSize: '0.875rem',
            minWidth: '600px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                <th style={thStyle}>Snag</th>
                <th style={thStyle}>Project</th>
                <th style={thStyle}>Trade</th>
                <th style={thStyle}>Deadline</th>
                <th style={thStyle}>Materials</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>ClickUp</th>
              </tr>
            </thead>
            <tbody>
              {snags.map((snag) => (
                <tr key={snag.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={tdStyle}>
                    <strong>{snag.snag_description}</strong>
                    {snag.additional_notes && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {snag.additional_notes.slice(0, 60)}
                        {snag.additional_notes.length > 60 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>{snag.project_name}</td>
                  <td style={tdStyle}>{snag.recommended_trade || '-'}</td>
                  <td style={tdStyle}>{snag.deadline || '-'}</td>
                  <td style={tdStyle}>{snag.materials_needed?.slice(0, 30) || '-'}</td>
                  <td style={tdStyle}>
                    <select
                      value={snag.status || 'new'}
                      onChange={(e) => handleStatusChange(snag.id, e.target.value)}
                      style={{ ...selectStyle, padding: '0.25rem 0.5rem', minWidth: 100 }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={tdStyle}>
                    {snag.clickup_task_id ? (
                      <span style={{ color: '#10b981' }}>Synced</span>
                    ) : (
                      <button
                        onClick={() => handleSync(snag.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#334155',
                          border: 'none',
                          borderRadius: 4,
                          color: '#e2e8f0',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Sync
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && snags.length === 0 && (
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          No snags yet. <Link to="/">Create a new audit</Link> to get started.
        </p>
      )}
    </div>
  );
}

const selectStyle = {
  padding: '0.75rem',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 12,
  color: '#e2e8f0',
  touchAction: 'manipulation',
};

const thStyle = {
  padding: '0.75rem 0.5rem',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '0.75rem 0.5rem',
  color: '#e2e8f0',
  verticalAlign: 'top',
};
