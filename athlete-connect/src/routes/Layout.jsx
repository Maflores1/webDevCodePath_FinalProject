import { Outlet, Link, useLocation } from "react-router-dom"

function Layout() {
  const location = useLocation();
  
  return (
    <div className="app">
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>🏅 Athlete Connect</h1>
          <p className="nav-subtitle">by USA Recruited</p>
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home Feed
          </Link>
          <Link 
            to="/create"
            className={location.pathname === '/create' ? 'active' : ''}
          >
            + Create Post
          </Link>
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