import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router.pathname]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const isActive = (path) => router.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        🖼 <span>Pix</span>Vault
      </Link>
      <div className="navbar-links">
        {!loading && user ? (
          <>
            <Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            <Link href="/upload" className={isActive('/upload')}>Upload</Link>
            <Link href="/search" className={isActive('/search')}>Search</Link>
            <Link href="/sql-explorer" className={isActive('/sql-explorer')}>SQL Explorer</Link>
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ marginLeft: '8px' }}>
              Sign Out
            </button>
          </>
        ) : !loading && (
          <>
            <Link href="/login" className={isActive('/login')}>Login</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
