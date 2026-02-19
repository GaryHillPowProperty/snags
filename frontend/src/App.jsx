import { Routes, Route, Link } from 'react-router-dom';
import VoiceRecorder from './components/VoiceRecorder';
import SnagReview from './components/SnagReview';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '1rem',
      paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <nav style={{ 
        marginBottom: '1.5rem', 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #334155'
      }}>
        <Link 
          to="/" 
          style={{ 
            color: '#38bdf8', 
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.5rem',
            display: 'inline-block'
          }}
        >
          New Audit
        </Link>
        <Link 
          to="/dashboard" 
          style={{ 
            color: '#38bdf8',
            fontSize: '1rem',
            padding: '0.5rem',
            display: 'inline-block'
          }}
        >
          Dashboard
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<VoiceRecorder />} />
        <Route path="/review/:auditId" element={<SnagReview />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
