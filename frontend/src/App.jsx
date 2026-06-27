import { useState } from 'react';
import './App.css';

function App() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleResearch() {
    if (!companyName.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://localhost:3001/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to connect to server. Is backend running?');
    }
    
    setLoading(false);
  }

  return (
    <div className="container">
      <h1>🔍 AI Investment Research Agent</h1>
      <p className="subtitle">Enter a company name to get an AI-powered investment decision</p>

      <div className="input-section">
        <input
          type="text"
          placeholder="e.g. Tesla, Apple, Reliance"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
        />
        <button onClick={handleResearch} disabled={loading}>
          {loading ? 'Researching...' : 'Research'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result-card">
          <h2>{result.company}</h2>
          <pre className="analysis">{result.analysis}</pre>
        </div>
      )}
    </div>
  );
}

export default App;