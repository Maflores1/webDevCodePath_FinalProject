import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import CommentSection from '../Components/CommentSection'

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ upvotes: post.upvotes + 1 })
        .eq('id', post.id);

      if (error) throw error;
      setPost(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      alert('Post deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
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

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (!post) {
    return <div className="loading">Post not found</div>;
  }

  return (
    <div className="post-detail-page">
      <Link to="/" className="back-button">← Back to Feed</Link>

      <div className="post-detail-container">
        {/* Post Header */}
        <div className="post-detail-header">
          <div className="post-detail-meta">
            <span className="category-badge">{post.category}</span>
            {post.is_mentor_post && <span className="mentor-badge">✨ Mentor</span>}
            <span className="post-time">{timeAgo(post.created_at)}</span>
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-author">
            <span>Posted by <strong>{post.author_name}</strong></span>
          </div>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="post-image-container">
            <img src={post.image_url} alt={post.title} className="post-image" />
          </div>
        )}

        {/* Post Content */}
        {post.content && (
          <div className="post-content">
            <p>{post.content}</p>
          </div>
        )}

        {/* Post Actions */}
        <div className="post-actions">
          <button onClick={handleUpvote} className="upvote-button-large">
            👍 Upvote ({post.upvotes})
          </button>

          <div className="post-action-buttons">
            <Link to={`/edit/${post.id}`} className="btn-edit">
              ✏️ Edit
            </Link>
            <button onClick={handleDelete} className="btn-delete">
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

export default PostDetail;