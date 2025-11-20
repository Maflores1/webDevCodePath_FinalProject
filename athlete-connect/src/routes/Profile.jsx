import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../Components/PostCard';
import FollowersModal from '../Components/FollowersModal';
import { showToast } from '../Components/Toast';

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [modalType, setModalType] = useState('followers');

  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'saved'

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    loadProfile();
    loadUserPosts();
    loadFollowStats(); // ADD THIS
    if (user && !isOwnProfile) {
      checkIfFollowing(); // ADD THIS
    }
  }, [id, user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id === id) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email.split('@')[0],
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadFollowStats = async () => {
    try {
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', id);

      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', id);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error loading follow stats:', error);
    }
  };

  const checkIfFollowing = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      showToast('Please log in to follow athletes! 🔒', 'info');
      return;
    }

    try {
      const { error } = await supabase
        .from('follows')
        .insert([{
          follower_id: user.id,
          following_id: id
        }]);

      if (error) throw error;

      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      showToast('Successfully followed!', 'success');
    } catch (error) {
      console.error('Error following:', error);
      showToast('Error following user', 'error');
    }
  };

  const handleUnfollow = async () => {
    if (!window.confirm('Unfollow this athlete?')) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', id);

      if (error) throw error;

      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      showToast('Unfollowed successfully', 'success');
    } catch (error) {
      console.error('Error unfollowing:', error);
      showToast('Error unfollowing user', 'error');
    }
  };

  const loadSavedPosts = async () => {
    if (!isOwnProfile) return; // Only show saved posts on own profile
    
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          created_at,
          posts (*)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Extract the posts from the join
      const posts = data.map(item => item.posts);
      setSavedPosts(posts || []);
    } catch (error) {
      console.error('Error loading saved posts:', error);
    }
  };

  // NOW useEffect (after all functions are defined)
  useEffect(() => {
    loadProfile();
    loadUserPosts();
    loadFollowStats();
    loadSavedPosts(); // ADD THIS
    if (user && !isOwnProfile) {
      checkIfFollowing();
    }
  }, [id, user]);

  const getDefaultAvatar = () => {
    if (!profile) return '';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&size=200&background=daa520&color=fff&bold=true`;
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="loading">
        <h2>Profile not found</h2>
        <Link to="/" className="btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Back Button */}
      <Link to="/" className="back-button" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Feed
      </Link>

      {/* Profile Header Card */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <img 
            src={profile.avatar_url || getDefaultAvatar()} 
            alt={profile.full_name}
            className="profile-avatar"
            onError={(e) => e.target.src = getDefaultAvatar()}
          />
          {profile.is_mentor && (
            <div className="mentor-badge-large">✨ Mentor</div>
          )}
          {/* Founder Badge */}
          {profile.email === 'floresmateo226@gmail.com' && (
            <div className="founder-badge-large">👑 Founder</div>
          )}
        </div>

        <div className="profile-info">
          <h1>{profile.full_name}</h1>
          
          <div className="profile-meta">
            {profile.sport && (
              <span className="profile-tag">🏅 {profile.sport}</span>
            )}
            {profile.university && (
              <span className="profile-tag">🎓 {profile.university}</span>
            )}
            {profile.country && (
              <span className="profile-tag">🌍 {profile.country}</span>
            )}
            {profile.graduation_year && (
              <span className="profile-tag">📅 Class of {profile.graduation_year}</span>
            )}
          </div>

          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}

          {/* Social Links */}
          {(profile.instagram || profile.linkedin) && (
            <div className="profile-social">
              {profile.instagram && (
                <a 
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  📷 Instagram
                </a>
              )}
              {profile.linkedin && (
                <a 
                  href={profile.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  💼 LinkedIn
                </a>
              )}
            </div>
          )}

          {/* Joined Badge */}
          <div className="profile-joined">
            <span className="joined-icon">📅</span>
            <span className="joined-text">
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {!isOwnProfile && user && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className={isFollowing ? 'btn-following' : 'btn-follow'}
              style={{ marginTop: '15px' }}
            >
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
          )}

          {isOwnProfile && (
            <Link to="/profile/edit" className="btn-edit" style={{ marginTop: '20px', display: 'inline-block' }}>
              ✏️ Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{posts.length}</span>
          <span className="stat-label">Posts</span>
        </div>
        
        <div 
          className="stat-item clickable-stat" 
          onClick={() => {
            setModalType('followers');
            setShowFollowersModal(true);
          }}
        >
          <span className="stat-number">{followersCount}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div 
          className="stat-item clickable-stat"
          onClick={() => {
            setModalType('following');
            setShowFollowersModal(true);
          }}
        >
          <span className="stat-number">{followingCount}</span>
          <span className="stat-label">Following</span>
        </div>

        <div className="stat-item">
          <span className="stat-number">{posts.reduce((sum, p) => sum + p.upvotes, 0)}</span>
          <span className="stat-label">Total Upvotes</span>
        </div>
        {showFollowersModal && (
          <FollowersModal 
            userId={id}
            type={modalType}
            onClose={() => setShowFollowersModal(false)}
          />
        )}
      </div>

      {/* User's Posts Section with Tabs */}
      <div className="profile-posts">
        {isOwnProfile && (
          <div className="profile-tabs">
            <button 
              className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              📝 My Posts ({posts.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              🔖 Saved Posts ({savedPosts.length})
            </button>
          </div>
        )}

        {!isOwnProfile && (
          <h2>Posts by {profile.full_name.split(' ')[0]} 📝</h2>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <>
            {posts.length > 0 ? (
              <div className="posts-container">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onUpdate={loadUserPosts} />
                ))}
              </div>
            ) : (
              <div className="no-posts">
                <p>
                  {isOwnProfile 
                    ? "You haven't posted yet. Share your first story! 🚀" 
                    : "No posts yet"}
                </p>
                {isOwnProfile && (
                  <Link to="/create" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                    📝 Create Your First Post
                  </Link>
                )}
              </div>
            )}
          </>
        )}

        {/* Saved Posts Tab */}
        {activeTab === 'saved' && isOwnProfile && (
          <>
            {savedPosts.length > 0 ? (
              <div className="posts-container">
                {savedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onUpdate={() => {
                      loadSavedPosts();
                      loadUserPosts();
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="no-posts">
                <p>No saved posts yet. Save posts to view them here! 🔖</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .profile-page {
          max-width: 1000px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-header {
          background: linear-gradient(135deg, var(--card-bg) 0%, #2d2d2d 100%);
          border: 1px solid var(--border-gold);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 30px;
          align-items: start;
        }

        .profile-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .mentor-badge-large {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 2px 10px rgba(168, 85, 247, 0.3);
        }

        .profile-info h1 {
          color: white;
          margin-bottom: 15px;
          font-size: 2em;
        }

        .profile-meta {
          display: flex;
          gap: 10px;
          margin: 15px 0;
          flex-wrap: wrap;
        }

        .profile-tag {
          background: rgba(218, 165, 32, 0.2);
          color: var(--primary-gold);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.9em;
          border: 1px solid var(--border-gold);
          font-weight: 500;
        }

        .profile-bio {
          color: #e0e0e0;
          line-height: 1.7;
          margin-top: 20px;
          font-size: 1.05em;
          padding: 15px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          border-left: 3px solid var(--primary-gold);
        }

        .profile-social {
          display: flex;
          gap: 15px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .social-link {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid #3b82f6;
          color: #60a5fa;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
        }

        .profile-joined {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          border-radius: 10px;
          color: #b0b0b0;
          font-size: 0.95em;
        }

        .joined-icon {
          font-size: 1.2em;
        }

        .joined-text {
          color: #888;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
          max-width: 1000px; 
          margin-left: auto;
          margin-right: auto;
        }

        .profile-posts {
          margin-top: 40px;
        }

        .profile-posts h2 {
          color: white;
          margin-bottom: 25px;
          font-size: 1.8em;
          padding-bottom: 15px;
        }

        .clickable-stat {
          cursor: pointer;
        }

        .clickable-stat:hover {
          background: rgba(218, 165, 32, 0.15);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-header {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 25px;
          }

          .profile-avatar-section {
            justify-content: center;
          }

          .profile-meta {
            justify-content: center;
          }

          .profile-social {
            justify-content: center;
          }

          .profile-stats {
            grid-template-columns: 1fr;
          }

          .profile-joined {
            justify-content: center;
            text-align: center;
          }

          .profile-info h1 {
            font-size: 1.6em;
          }

          .btn-follow,
          .btn-following {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            font-size: 1em;
          }

          .btn-follow {
            background: var(--primary-gold);
            color: #000;
          }

          .btn-follow:hover {
            background: var(--light-gold);
            transform: scale(1.05);
          }

          .btn-following {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
            border: 1px solid #4ade80;
          }

          .btn-following:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border-color: #f87171;
          } 
        }
      `}</style>
    </div>
  );
}

export default Profile;