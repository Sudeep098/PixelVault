import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ImageCard from '../components/ImageCard';

export default function Dashboard() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setUser(d.user))
      .catch(() => router.push('/login'));

    fetch('/api/images')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setImages(d.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...images].sort((a, b) => {
    if (sort === 'newest') return new Date(b.upload_date) - new Date(a.upload_date);
    if (sort === 'oldest') return new Date(a.upload_date) - new Date(b.upload_date);
    if (sort === 'name') return a.image_name.localeCompare(b.image_name);
    return 0;
  });

  const handleDelete = (id) => setImages(prev => prev.filter(img => img.image_id !== id));

  const handleEdit = (updated) => setImages(prev => prev.map(img => img.image_id === updated.image_id ? { ...img, ...updated } : img));

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">My Images</h1>
            <p className="page-subtitle">
              {loading ? '...' : `${images.length} image${images.length !== 1 ? 's' : ''} uploaded`}
              {user && ` · Welcome, ${user.username}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto' }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">By name</option>
            </select>
            <Link href="/upload" className="btn btn-primary">+ Upload</Link>
          </div>
        </div>

        {loading && <div className="spinner" />}

        {!loading && images.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🖼</div>
            <h3>No images yet</h3>
            <p style={{ marginBottom: '20px' }}>Upload your first image to get started</p>
            <Link href="/upload" className="btn btn-primary">Upload Image</Link>
          </div>
        )}

        {!loading && images.length > 0 && (
          <div className="image-grid">
            {sorted.map(img => (
              <ImageCard key={img.image_id} image={img} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
