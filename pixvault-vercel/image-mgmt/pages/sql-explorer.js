import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

const CATEGORY_COLORS = {
  'Basic Select': 'badge-blue',
  'DISTINCT': 'badge-purple',
  'String Functions': 'badge-green',
  'Filter / WHERE': 'badge-blue',
  'LEFT JOIN / NULL': 'badge-purple',
  'GROUP BY / HAVING': 'badge-pink',
  'JOIN / Filter': 'badge-blue',
  'Multi-table JOIN': 'badge-green',
  'Date Functions': 'badge-pink',
  'Pattern Matching': 'badge-purple',
  'Aggregation / HAVING': 'badge-pink',
  'ORDER BY': 'badge-blue',
  'OR Condition': 'badge-green',
  'Date Arithmetic': 'badge-pink',
  'Aggregation': 'badge-purple',
  'Aggregation / Subquery': 'badge-green',
};

const QUERY_LIST = [
  { id: 1, title: 'Show All Images', category: 'Basic Select' },
  { id: 2, title: 'Unique Tags', category: 'DISTINCT' },
  { id: 3, title: 'Image Name + Tag Concatenation', category: 'String Functions' },
  { id: 4, title: 'Images Uploaded After 2024-01-01', category: 'Filter / WHERE' },
  { id: 5, title: 'Images Without Persons', category: 'LEFT JOIN / NULL' },
  { id: 6, title: 'Images With Multiple Tags', category: 'GROUP BY / HAVING' },
  { id: 7, "title": "Images Tagged 'Trip'", category: 'JOIN / Filter' },
  { id: 8, title: 'Images Containing Specific Person', category: 'Multi-table JOIN' },
  { id: 9, title: 'Images Uploaded in Current Year', category: 'Date Functions' },
  { id: 10, title: "Images With 'birthday' in Description", category: 'Pattern Matching' },
  { id: 11, title: 'Images With More Than 3 Tags', category: 'Aggregation / HAVING' },
  { id: 12, title: 'Sort Images by Upload Date', category: 'ORDER BY' },
  { id: 13, "title": "Image Names 3rd Letter = 'a'", category: 'Pattern Matching' },
  { id: 14, "title": "Images Tagged 'Trip' or 'College'", category: 'OR Condition' },
  { id: 15, title: 'Tags in More Than 5 Images', category: 'GROUP BY / HAVING' },
  { id: 16, title: 'Current Date Display', category: 'Date Functions' },
  { id: 17, title: 'Months Since Image Uploaded', category: 'Date Arithmetic' },
  { id: 18, title: 'Image Upload Summary', category: 'String Functions' },
  { id: 19, title: 'Tag Count per Image', category: 'Aggregation' },
  { id: 20, title: 'Capitalized Image Names', category: 'String Functions' },
  { id: 21, title: 'Day of Week Uploaded', category: 'Date Functions' },
  { id: 22, title: 'Image With Person and Tag', category: 'Multi-table JOIN' },
  { id: 23, title: 'Unique Tags per User', category: 'Multi-table JOIN' },
  { id: 24, "title": "Images Containing Letter 'a'", category: 'Pattern Matching' },
  { id: 25, title: 'Most Tagged Images', category: 'Aggregation / Subquery' },
];

export default function SqlExplorer() {
  const router = useRouter();
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); });
  }, []);

  const runQuery = async (id) => {
    setActive(id);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/run-query/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">SQL Query Explorer</h1>
          <p className="page-subtitle">25 live SQL queries demonstrating DBMS concepts — run them on your actual data</p>
        </div>

        <div className="sql-layout">
          {/* Sidebar */}
          <div className="sql-sidebar">
            <div className="sql-sidebar-header">25 Queries</div>
            {QUERY_LIST.map(q => (
              <button
                key={q.id}
                className={`query-btn ${active === q.id ? 'active' : ''}`}
                onClick={() => runQuery(q.id)}
              >
                <span className="query-num">Q{String(q.id).padStart(2,'0')}</span>
                {q.title}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="sql-panel">
            {!active && (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗄</div>
                <h3 style={{ marginBottom: '8px' }}>Select a query</h3>
                <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Click any query from the left panel to run it on your database</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
                  {['JOINs','Aggregation','Subqueries','String Functions','Date Ops','Pattern Matching'].map(c => (
                    <span key={c} className="badge badge-purple">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p style={{ color: 'var(--text2)', marginTop: '16px', fontSize: '14px' }}>Executing query...</p>
              </div>
            )}

            {error && !loading && (
              <div className="alert alert-error">
                <strong>Query Error:</strong> {error}
              </div>
            )}

            {result && !loading && (
              <>
                {/* Header */}
                <div className="card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', marginRight: '10px' }}>
                          Q{String(active).padStart(2,'0')}
                        </span>
                        {result.title}
                      </h2>
                      <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{result.explanation}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <span className={`badge ${CATEGORY_COLORS[result.category] || 'badge-blue'}`}>{result.category}</span>
                      <span className="badge badge-green">{result.execTimeMs}ms</span>
                      <span className="badge badge-blue">{result.rowCount} rows</span>
                    </div>
                  </div>
                </div>

                {/* SQL Code */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>SQL Query</span>
                  </div>
                  <div className="sql-code-block">{result.sql}</div>
                </div>

                {/* Results Table */}
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Result — {result.rowCount} row{result.rowCount !== 1 ? 's' : ''}
                  </div>

                  {result.rowCount === 0 ? (
                    <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text2)' }}>No rows returned — upload more images with tags &amp; persons to see results</p>
                    </div>
                  ) : (
                    <div className="results-table-wrap">
                      <table className="results-table">
                        <thead>
                          <tr>
                            {result.columns.map(col => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr key={i}>
                              {result.columns.map(col => (
                                <td key={col} title={String(row[col] ?? '')}>
                                  {row[col] === null ? <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>NULL</span>
                                    : Array.isArray(row[col]) ? row[col].join(', ')
                                    : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
