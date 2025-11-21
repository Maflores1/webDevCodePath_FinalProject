import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import CommentSection from '../Components/CommentSection'
import { showToast } from '../Components/Toast';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Check if current user is the post author OR founder
  const isAuthor = user && post && post.user_id === user.id;
  const FOUNDER_EMAIL = 'floresmateo226@gmail.com';
  const isFounder = profile && profile.email === FOUNDER_EMAIL;
  const canEditDelete = isAuthor || isFounder;

  useEffect(() => {
    loadPost();
  }, [id]);

  useEffect(() => {
    const checkLikeAndSaveStatus = async () => {
      if (user && post) {
        try {
          // Check like status
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post.id)
            .maybeSingle();
          
          setIsLiked(!!likeData);

          // Check saved status
          const { data: savedData } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post.id)
            .maybeSingle();
          
          setIsSaved(!!savedData);
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }
    };
    
    checkLikeAndSaveStatus();
  }, [user, post]);

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
      showToast('Post not found', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      showToast('Please log in to upvote posts! 🔒', 'error');
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        // Unlike: remove the like
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
        
        if (deleteError) throw deleteError;
        
        // Decrement upvotes
        const { error: updateError } = await supabase
          .from('posts')
          .update({ upvotes: post.upvotes - 1 })
          .eq('id', post.id);
        
        if (updateError) throw updateError;
        
        setPost(prev => ({ ...prev, upvotes: prev.upvotes - 1 }));
        setIsLiked(false);
      } else {
        // Like: add the like
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({ user_id: user.id, post_id: post.id });
        
        if (insertError) throw insertError;
        
        // Increment upvotes
        const { error: updateError } = await supabase
          .from('posts')
          .update({ upvotes: post.upvotes + 1 })
          .eq('id', post.id);
        
        if (updateError) throw updateError;
        
        setPost(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      showToast('Error updating upvote. Please try again.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!canEditDelete) {
      showToast('You can only delete your own posts!', 'error');
      return;
    }

    const confirmMessage = isFounder && !isAuthor 
      ? '🛡️ FOUNDER: Are you sure you want to remove this post?' 
      : 'Are you sure you want to delete this post? This cannot be undone.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      showToast('Post deleted successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Error deleting post. Please try again.', 'error');
    }
  };

  const handlePinPost = async () => {
    if (!isFounder) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', post.id);

      if (error) throw error;
      
      setPost(prev => ({ ...prev, is_pinned: !prev.is_pinned }));
      showToast(post.is_pinned ? 'Post unpinned' : 'Post pinned to top!', 'success');
    } catch (error) {
      console.error('Error pinning post:', error);
      showToast('Error pinning post', 'error');
    }
  };

  const handleSave = async () => {
  if (!user) {
    showToast('Please log in to save posts! 🔒', 'error');
    navigate('/login');
    return;
  }

  try {
    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', post.id);
      
      if (error) throw error;
      
      setIsSaved(false);
      showToast('Post removed from saved', 'success');
    } else {
      // Save
      const { error } = await supabase
        .from('saved_posts')
        .insert({ user_id: user.id, post_id: post.id });
      
      if (error) throw error;
      
      setIsSaved(true);
      showToast('Post saved! 📌', 'success');
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    showToast('Error saving post', 'error');
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
            {post.is_mentor_post && <span className="mentor-badge">Mentor</span>}
            {/* FOUNDER BADGE - only shows if author is you */}
            {post.author_name === 'Mateo Flores' && (
            <span className="founder-badge">👑 Founder</span>
          )}
            <span className="post-time">{timeAgo(post.created_at)}</span>
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-author">
            <span>Posted by <strong>{post.author_name}</strong></span>
          </div>
        </div>

        {/* Post Image */}
        {post.image_url && post.media_type !== 'video' && (
          <div className="post-image-container">
            <img src={post.image_url} alt={post.title} className="post-image" />
          </div>
        )}

        {/* Post Video */}
        {post.video_url && post.media_type === 'video' && (
          <div className="post-image-container">
            <video src={post.video_url} controls className="post-image" />
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
          <button 
            onClick={handleUpvote} 
            className={`upvote-button-large ${isLiked ? 'liked' : ''}`}
          >
            {isLiked ? '❤️' : '❤️'} {isLiked ? 'Liked' : 'Like'} ({post.upvotes})
          </button>

          

          {canEditDelete && (
            <div className="post-action-buttons">
              <button 
                onClick={handleSave} 
                className={`save-button-large ${isSaved ? 'saved' : ''}`}
              >
                {isSaved ? '🔖 Saved' : '🔖 Save'}
              </button>
              {isFounder && (
                <button onClick={handlePinPost} className="btn-pin">
                  {post.is_pinned ? '📌 Unpin' : '📌 Pin'}
                </button>
              )}
              {isAuthor && (
                <Link to={`/edit/${post.id}`} className="btn-edit">
                  ✏️ Edit
                </Link>
              )}
              <button onClick={handleDelete} className="btn-delete">
                {isFounder && !isAuthor ? '🛡️ Remove' : '🗑️ Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Comments Section - Pass user prop */}
        <CommentSection postId={post.id} user={user} profile={profile} />
      </div>

      <style>{`
        .founder-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(255, 215, 0, 0.4);
        }

        .btn-pin {
          padding: 10px 20px;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid #ff6b6b;
          color: #ff6b6b;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-pin:hover {
          background: rgba(255, 107, 107, 0.2);
        }

        .upvote-button-large {
          background-color: black;
          color: white;
        }

        .save-button-large {
          background-color: black;
          color: white;
          border: 2px solid var(--primary-gold);
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1.1em;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-button-large:hover {
          background: rgba(218, 165, 32, 0.3);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default PostDetail;