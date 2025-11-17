import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../Components/Toast';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalUpvotes: 0
  });

  const FOUNDER_EMAIL = 'floresmateo226@gmail.com';

  useEffect(() => {
    // Check if user is founder
    if (!profile || profile.email !== FOUNDER_EMAIL) {
      showToast('Access Denied: Founder Only', 'warning');
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      // Load all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Load all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Load all comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (commentsError) throw commentsError;

      setPosts(postsData || []);
      setUsers(usersData || []);
      setComments(commentsData || []);

      // Calculate stats
      const totalUpvotes = postsData?.reduce((sum, post) => sum + post.upvotes, 0) || 0;
      setStats({
        totalPosts: postsData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalComments: commentsData?.length || 0,
        totalUpvotes
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('🛡️ FOUNDER: Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      showToast('Post deleted successfully', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Error deleting post', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      showToast('Comment deleted', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast('Error deleting comment', 'error');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>👑 Founder Dashboard</h1>
        <p>Platform Overview & Management</p>
        <Link to="/" className="btn-secondary">← Back to Home</Link>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>{stats.totalComments}</h3>
            <p>Total Comments</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">👍</div>
          <div className="stat-info">
            <h3>{stats.totalUpvotes}</h3>
            <p>Total Upvotes</p>
          </div>
        </div>
      </div>

      {/* Posts Management */}
      <div className="admin-section">
        <h2>📝 Posts Management</h2>
        <div className="admin-table">
          {posts.map(post => (
            <div key={post.id} className="admin-item">
              <div className="admin-item-info">
                <h3>{post.title}</h3>
                <div className="admin-item-meta">
                  <span className="badge">{post.category}</span>
                  <span>{post.author_name}</span>
                  <span>👍 {post.upvotes}</span>
                  <span>{timeAgo(post.created_at)}</span>
                </div>
              </div>
              <div className="admin-item-actions">
                <Link to={`/post/${post.id}`} className="btn-view">
                  👁️ View
                </Link>
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="btn-delete-admin"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Management */}
      <div className="admin-section">
        <h2>👥 Users</h2>
        <div className="admin-table">
          {users.map(user => (
            <div key={user.id} className="admin-item">
              <div className="admin-item-info">
                <h3>{user.full_name}</h3>
                <div className="admin-item-meta">
                  {user.sport && <span>🏅 {user.sport}</span>}
                  {user.university && <span>🎓 {user.university}</span>}
                  {user.country && <span>🌍 {user.country}</span>}
                  {user.is_mentor && <span className="badge-mentor">✨ Mentor</span>}
                  <span>{timeAgo(user.created_at)}</span>
                </div>
              </div>
              <div className="admin-item-actions">
                <Link to={`/profile/${user.id}`} className="btn-view">
                  👁️ View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Comments */}
      <div className="admin-section">
        <h2>💬 Recent Comments</h2>
        <div className="admin-table">
          {comments.map(comment => (
            <div key={comment.id} className="admin-item">
              <div className="admin-item-info">
                <p className="comment-text">{comment.content}</p>
                <div className="admin-item-meta">
                  <span>{comment.author_name}</span>
                  <span>{timeAgo(comment.created_at)}</span>
                </div>
              </div>
              <div className="admin-item-actions">
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="btn-delete-admin"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .admin-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(218, 165, 32, 0.1));
          border-radius: 20px;
          border: 2px solid var(--primary-gold);
        }

        .admin-header h1 {
          color: var(--primary-gold);
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .admin-header p {
          color: #b0b0b0;
          font-size: 1.2em;
          margin-bottom: 20px;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .admin-stat-card {
          background: var(--card-bg);
          border: 1px solid var(--border-gold);
          border-radius: 15px;
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .admin-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(218, 165, 32, 0.3);
        }

        .stat-icon {
          font-size: 3em;
        }

        .stat-info h3 {
          color: var(--primary-gold);
          font-size: 2em;
          margin: 0;
        }

        .stat-info p {
          color: #888;
          margin: 5px 0 0 0;
        }

        .admin-section {
          background: var(--card-bg);
          border: 1px solid var(--border-gold);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
        }

        .admin-section h2 {
          color: var(--primary-gold);
          margin-bottom: 20px;
          font-size: 1.8em;
        }

        .admin-table {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .admin-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-gold);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .admin-item:hover {
          background: rgba(218, 165, 32, 0.05);
        }

        .admin-item-info {
          flex: 1;
        }

        .admin-item-info h3 {
          color: white;
          margin: 0 0 10px 0;
          font-size: 1.2em;
        }

        .comment-text {
          color: #e0e0e0;
          margin: 0 0 10px 0;
          line-height: 1.6;
        }

        .admin-item-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: center;
        }

        .admin-item-meta span {
          color: #888;
          font-size: 0.9em;
        }

        .badge {
          background: rgba(218, 165, 32, 0.2);
          color: var(--primary-gold);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.85em;
          border: 1px solid var(--border-gold);
        }

        .badge-mentor {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.85em;
        }

        .admin-item-actions {
          display: flex;
          gap: 10px;
        }

        .btn-view {
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid #3b82f6;
          color: #60a5fa;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-view:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .btn-delete-admin {
          padding: 8px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #f87171;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-delete-admin:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 768px) {
          .admin-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .admin-item-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;