import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <h1>Store, Tag &amp; Search<br />Your Images</h1>
          <p>Upload images, add metadata — persons, tags, descriptions — and find them instantly with powerful search.</p>
          <div className="hero-btns">
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '16px', padding: '12px 28px' }}>
              Get Started Free
            </Link>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: '16px', padding: '12px 28px' }}>
              Sign In
            </Link>
          </div>
        </section>

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', paddingBottom: '80px' }}>
            {[
              { icon: '📤', title: 'Upload & Tag', desc: 'Upload images and add rich metadata — names, persons, tags, and descriptions.' },
              { icon: '🔍', title: 'Smart Search', desc: 'Search by person name, tag, image name, or upload date with SQL-powered precision.' },
              { icon: '🗄', title: 'SQL Explorer', desc: 'Run 25 live SQL queries on your data — JOINs, aggregations, date ops and more.' },
              { icon: '🔒', title: 'Secure Auth', desc: 'Your images are private. JWT-based auth with secure password hashing.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: '14px' }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Schema Preview */}
          <div style={{ paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Relational Database Schema</h2>
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '20px' }}>Built with PostgreSQL — normalized schema with many-to-many relationships.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Users', 'Images', 'Persons', 'Tags', 'Image_Person', 'Image_Tag'].map(t => (
                <span key={t} className="badge badge-purple" style={{ fontSize: '13px', padding: '6px 14px' }}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text3)' }}>
              <span>Users (1) → (N) Images</span>
              <span>·</span>
              <span>Images (N) ↔ (N) Persons</span>
              <span>·</span>
              <span>Images (N) ↔ (N) Tags</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
