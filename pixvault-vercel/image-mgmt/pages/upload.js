import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Upload() {
  const router = useRouter();
  const fileRef = useRef();
  const [form, setForm] = useState({ image_name: '', description: '', persons: '', tags: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); });
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['jpg','jpeg','png','gif','webp'].includes(ext)) {
      setError('Only jpg, jpeg, png, gif, webp files allowed.');
      return;
    }
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
    if (!form.image_name) setForm(prev => ({ ...prev, image_name: f.name.replace(/\.[^.]+$/, '') }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image file.');
    if (!form.image_name.trim()) return setError('Image name is required.');

    setLoading(true);
    setError('');
    setSuccess('');

    const fd = new FormData();
    fd.append('image', file);
    fd.append('image_name', form.image_name);
    fd.append('description', form.description);
    fd.append('persons', form.persons);
    fd.append('tags', form.tags);

    try {
      const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccess('Image uploaded successfully!');
      setForm({ image_name: '', description: '', persons: '', tags: '' });
      setFile(null);
      setPreview(null);
      setTimeout(() => router.push('/dashboard'), 1500);
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
          <h1 className="page-title">Upload Image</h1>
          <p className="page-subtitle">Add an image with metadata — tags, persons, and description</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr', gap: '24px', maxWidth: '900px' }}>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            {/* Drop Zone */}
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '18px',
                background: dragging ? 'rgba(108,99,255,0.05)' : 'var(--bg3)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📁</div>
              <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
                {file ? `✅ ${file.name}` : 'Click or drag & drop an image here'}
              </p>
              <p style={{ color: 'var(--text3)', fontSize: '12px', marginTop: '4px' }}>JPG, JPEG, PNG, GIF, WEBP</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

            <div className="form-group">
              <label className="form-label">Image Name *</label>
              <input
                type="text"
                placeholder="Beach Trip 2024"
                value={form.image_name}
                onChange={e => setForm({ ...form, image_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                placeholder="A short description of this image..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">People in Image <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(comma separated)</span></label>
              <input
                type="text"
                placeholder="Rahul, Priya, Amit"
                value={form.persons}
                onChange={e => setForm({ ...form, persons: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(comma separated)</span></label>
              <input
                type="text"
                placeholder="trip, beach, vacation, 2024"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }} disabled={loading}>
                {loading ? '⏳ Uploading...' : '📤 Upload Image'}
              </button>
              <Link href="/dashboard" className="btn btn-ghost">Cancel</Link>
            </div>
          </form>

          {preview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-label">Preview</div>
              <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '400px', border: '1px solid var(--border)' }} />
              {form.tags && (
                <div className="tag-list">
                  {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="badge badge-purple">{t}</span>
                  ))}
                </div>
              )}
              {form.persons && (
                <div className="tag-list">
                  {form.persons.split(',').map(p => p.trim()).filter(Boolean).map(p => (
                    <span key={p} className="badge badge-pink">👤 {p}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
