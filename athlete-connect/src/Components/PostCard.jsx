import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function PostCard({ post, onUpdate }) {
  const [authorProfile, setAuthorProfile] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (post.user_id) {
      loadAuthorProfile();
    }
    loadCommentCount();
  }, [post.id, post.user_id]);

  const loadAuthorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, email')
        .eq('id', post.user_id)
        .maybeSingle();

      if (error) throw error;
      setAuthorProfile(data);
    } catch (error) {
      console.error('Error loading author:', error);
    }
  };

  const loadCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);

      if (error) throw error;
      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error loading comment count:', error);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', post.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const getAvatarUrl = () => {
    if (authorProfile?.avatar_url) return authorProfile.avatar_url;
    const name = authorProfile?.full_name || post.author_name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=daa520&color=fff&bold=true`;
  };

  const isFounder = authorProfile?.email === 'floresmateo226@gmail.com';

  return (
    <Link to={`/post/${post.id}`} className="post-card">
      {/* Pinned Badge */}
      {post.is_pinned && (
        <div className="pinned-badge">
          📌
        </div>
      )}

      <div className="post-header">
        <div className="post-meta">
          <span className="category-badge">{post.category}</span>
          {post.is_mentor_post && <span className="mentor-badge">✨ Mentor</span>}
          {isFounder && <span className="founder-badge">👑 Founder</span>}
        </div>
        <span className="post-time">{timeAgo(post.created_at)}</span>
      </div>

      <h2 className="post-title">{post.title}</h2>


      <div className="post-footer">
        {/* Comment Count */}
        <span className="comment-count">
          💬 {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </span>
        
        <button 
          onClick={handleUpvote}
          className="upvote-button"
        >
          👍 {post.upvotes}
        </button>
      </div>

      {/* Author Info with Avatar */}
      <div className="post-author-info">
        <img 
          src={getAvatarUrl()} 
          alt={post.author_name}
          className="author-avatar"
        />
        <span className="author-name">by {post.author_name}</span>
      </div>

      <style>{`
        .post-card {
          background: linear-gradient(135deg, var(--card-bg) 0%, #2d2d2d 100%);
          border: 1px solid var(--border-gold);
          border-radius: 15px;
          padding: 20px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .post-card:hover::before {
          opacity: 1;
        }

        .pinned-badge {
          position: absolute;
          top: 20px;
          right: 100px;
          background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
        }

        .category-badge {
          background: rgba(218, 165, 32, 0.2);
          color: var(--primary-gold);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          border: 1px solid var(--border-gold);
        }

        .mentor-badge {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .founder-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(255, 215, 0, 0.4);
        }

        .post-time {
          color: #888;
          font-size: 0.9em;
        }

        .post-author-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;   
          padding-top: 10px;
          border-top: 1px solid rgba(218, 165, 32, 0.2);
        }

        .author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--primary-gold);
          object-fit: cover;
        }

        .author-name {
          color: #b0b0b0;
          font-size: 0.9em;
        }

        .comment-count {
          color: #888;
          font-size: 0.9em;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .upvote-button {
          background: rgba(218, 165, 32, 0.1);
          border: 1px solid var(--primary-gold);
          color: var(--primary-gold);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upvote-button:hover {
          background: rgba(218, 165, 32, 0.2);
          transform: scale(1.05);
        }
      `}</style>
    </Link>
  );
}

export default PostCard;