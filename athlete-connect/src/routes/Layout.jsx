import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'
import { useState } from "react";
import { showToast } from '../Components/Toast';

function Layout() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const isFounder = profile && profile.email === 'floresmateo226@gmail.com'; 
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      showToast('Error signing out', 'error');
    }
  };

  return (
    <div className="app">
      <nav className="main-nav">
      <div className="nav-brand">
        <img src="/logo.png" alt="Agency Logo" className="logo" />
        <div className="brand-text">
          <h1>Athlete Connect</h1>
          <p className="nav-subtitle">by USA Recruited</p>
        </div>

        <button 
          className="hamburger" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''} 
          onClick={() => setMenuOpen(false)}  // closes menu
        >
          Home Feed
        </Link>
        <Link 
          to="/about" 
          className={location.pathname === '/about' ? 'active' : ''} 
          onClick={() => setMenuOpen(false)}  // closes menu
        >
          About
        </Link>

        <Link to="/community" className={location.pathname === '/community' ? 'active' : ''}
        onClick={() => setMenuOpen(false)}
        >
          🌍 Community
        </Link>

        {user ? (
          <>
            <Link 
              to="/create" 
              className={location.pathname === '/create' ? 'active' : ''} 
              onClick={() => setMenuOpen(false)}
            >
              + Create Post
            </Link>
            {isFounder && (
              <Link 
                to="/admin" 
                className={location.pathname === '/admin' ? 'active' : ''} 
                style={{ color: 'white', fontWeight: 'bold' }}
                onClick={() => setMenuOpen(false)}
              >
                👑 Admin
              </Link>
            )}
            <Link 
              to={`/profile/${user.id}`} 
              onClick={() => setMenuOpen(false)}
            >
              👤 {profile?.full_name || 'Profile'}
            </Link>
            <button 
              onClick={() => { handleSignOut(); setMenuOpen(false); }} 
              className="nav-link-button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={location.pathname === '/login' ? 'active' : ''} 
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className={location.pathname === '/register' ? 'active' : ''} 
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="footer">
        <p>Built with ❤️ for international student-athletes</p>
        <p className="footer-brand">USA Recruited © 2025</p>
      </footer>
    </div>
  )
}

export default Layout