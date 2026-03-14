import { useState } from 'react';
import ImageDetailModal from './ImageDetailModal';

export default function ImageCard({ image, onDelete, onEdit }) {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <>
      <div className="image-card" onClick={() => setShowModal(true)}>
        <img
          src={image.image_path}
          alt={image.image_name}
          className="image-card-thumb"
          onError={e => { e.target.src = 'https://placehold.co/400x200/111118/6c63ff?text=Image'; }}
        />
        <div className="image-card-body">
          <div className="image-card-title">{image.image_name}</div>
          <div className="image-card-date">{formatDate(image.upload_date)}</div>
          <div className="tag-list">
            {(image.tags || []).slice(0, 3).map(tag => (
              <span key={tag} className="badge badge-purple">{tag}</span>
            ))}
            {(image.persons || []).slice(0, 2).map(p => (
              <span key={p} className="badge badge-pink">{p}</span>
            ))}
            {(image.tags?.length || 0) + (image.persons?.length || 0) > 5 && (
              <span className="badge badge-blue">+more</span>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <ImageDetailModal
          image={image}
          onClose={() => setShowModal(false)}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    </>
  );
}
