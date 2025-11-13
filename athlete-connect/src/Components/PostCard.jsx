import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function PostCard({ post, onUpdate }) {
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
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', post.id);

      if (error) throw error;
      onUpdate(); // Refresh posts
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  return (
    <Link to={`/post/${post.id}`} className="post-card">
      <div className="post-header">
        <div className="post-meta">
          <span className="category-badge">{post.category}</span>
          {post.is_mentor_post && <span className="mentor-badge">✨ Mentor</span>}
        </div>
        <span className="post-time">{timeAgo(post.created_at)}</span>
      </div>

      <h2 className="post-title">{post.title}</h2>

      <div className="post-footer">
        <span className="post-author">by {post.author_name}</span>
        
        <button 
          onClick={handleUpvote}
          className="upvote-button"
        >
          👍 {post.upvotes}
        </button>
      </div>
    </Link>
  );
}

export default PostCard;