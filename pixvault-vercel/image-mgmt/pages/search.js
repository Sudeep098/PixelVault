import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import ImageCard from '../components/ImageCard';

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('name');
  const [date, setDate] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); });
  }, []);

  const handleSearch = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ type });
      if (type === 'date') params.set('date', date);
      else params.set('q', query);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data.images || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => setResults(prev => prev.filter(img => img.image_id !== id));
  const handleEdit = (updated) => setResults(prev => prev.map(img => img.image_id === updated.image_id ? { ...img, ...updated } : img));

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Search Images</h1>
          <p className="page-subtitle">Find images by person, tag, name, or upload date</p>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <select value={type} onChange={e => { setType(e.target.value); setQuery(''); setDate(''); }}>
            <option value="name">By Image Name</option>
            <option value="person">By Person</option>
            <option value="tag">By Tag</option>
            <option value="date">By Date</option>
          </select>

          {type === 'date' ? (
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ flex: 1 }}
            />
          ) : (
            <input
              type="text"
              placeholder={
                type === 'person' ? 'e.g. Rahul' :
                type === 'tag' ? 'e.g. trip, birthday' :
                'e.g. Beach photo'
              }
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1 }}
            />
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '...' : '🔍 Search'}
          </button>
        </form>

        {/* Quick Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[['person','Rahul'], ['tag','trip'], ['tag','birthday'], ['tag','college']].map(([t, q]) => (
            <button
              key={`${t}-${q}`}
              className="btn btn-ghost btn-sm"
              onClick={() => { setType(t); setQuery(q); setTimeout(() => handleSearch(), 50); }}
            >
              {t === 'person' ? '👤' : '🏷'} {q}
            </button>
          ))}
        </div>

        {loading && <div className="spinner" />}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different search term or filter</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '20px' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
            <div className="image-grid">
              {results.map(img => (
                <ImageCard key={img.image_id} image={img} onDelete={handleDelete} onEdit={handleEdit} />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="empty-state">
            <div className="empty-state-icon">🖼</div>
            <h3>Start searching</h3>
            <p>Enter a search term above to find your images</p>
          </div>
        )}
      </div>
    </>
  );
}
