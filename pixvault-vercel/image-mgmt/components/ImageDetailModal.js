import { useState } from 'react';

export default function ImageDetailModal({ image, onClose, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    image_name: image.image_name,
    description: image.description || '',
    tags: (image.tags || []).join(', '),
    persons: (image.persons || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/images/${image.image_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      onEdit && onEdit({ ...image, ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), persons: form.persons.split(',').map(p => p.trim()).filter(Boolean) });
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this image permanently?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/images/${image.image_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onDelete && onDelete(image.image_id);
      onClose();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>

        <img
          src={image.image_path}
          alt={image.image_name}
          style={{ width: '100%', borderRadius: '10px', maxHeight: '340px', objectFit: 'cover', marginBottom: '20px', background: 'var(--bg3)' }}
          onError={e => { e.target.src = 'https://placehold.co/700x340/111118/6c63ff?text=Image'; }}
        />

        {error && <div className="alert alert-error">{error}</div>}

        {editing ? (
          <div>
            <div className="form-group">
              <label className="form-label">Image Name</label>
              <input value={form.image_name} onChange={e => setForm({...form, image_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="nature, trip, birthday" />
            </div>
            <div className="form-group">
              <label className="form-label">Persons (comma separated)</label>
              <input value={form.persons} onChange={e => setForm({...form, persons: e.target.value})} placeholder="Rahul, Priya" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>{image.image_name}</h2>
            <p style={{ color: 'var(--text3)', fontSize: '13px', marginBottom: '16px' }}>
              📅 {formatDate(image.upload_date)}
            </p>

            {image.description && (
              <p style={{ color: 'var(--text2)', marginBottom: '16px', fontSize: '14px' }}>{image.description}</p>
            )}

            {image.tags?.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div className="form-label" style={{ marginBottom: '6px' }}>Tags</div>
                <div className="tag-list">
                  {image.tags.map(t => <span key={t} className="badge badge-purple">{t}</span>)}
                </div>
              </div>
            )}

            {image.persons?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div className="form-label" style={{ marginBottom: '6px' }}>People</div>
                <div className="tag-list">
                  {image.persons.map(p => <span key={p} className="badge badge-pink">👤 {p}</span>)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : '🗑 Delete'}
              </button>
              <a href={image.image_path} target="_blank" rel="noopener" className="btn btn-ghost btn-sm">↗ Open Full</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
