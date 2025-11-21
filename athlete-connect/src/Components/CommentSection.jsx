import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from './Toast';
import { notifyNewComment } from '../services/notificationService';

function CommentSection({ postId }) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in to comment! 🔒', 'error');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      showToast('Please write a comment', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          content: newComment.trim(),
          author_name: profile?.full_name || user.email,
          user_id: user.id
        }])
        .select();

      if (error) throw error;

      // Get post details for notification
      const { data: post } = await supabase
        .from('posts')
        .select('title, user_id')
        .eq('id', postId)
        .single();

      // Create notification for post author
      if (post && post.user_id !== user.id) {
        notifyNewComment(
          post.user_id,
          profile?.full_name || user.email,
          post.title,
          postId,
          user.id
        ).catch(err => console.error('Failed to create notification:', err));
      }

      setComments(prev => [...prev, data[0]]);
      setNewComment('');
      showToast('Comment added! 💬', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Error adding comment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) {
      showToast('Comment cannot be empty', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, content: editContent.trim() }
            : comment
        )
      );

      setEditingId(null);
      setEditContent('');
      showToast('Comment updated! ✏️', 'success');
    } catch (error) {
      console.error('Error updating comment:', error);
      showToast('Error updating comment. Please try again.', 'error');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      showToast('Comment deleted! 🗑️', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast('Error deleting comment. Please try again.', 'error');
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

  return (
    <div className="comments-section">
      <h3>Comments ({comments.length})</h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows="3"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !newComment.trim()}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <p className="loading-comments">Loading comments...</p>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <strong className="comment-author">{comment.author_name}</strong>
                <span className="comment-time">{timeAgo(comment.created_at)}</span>
              </div>

              {editingId === comment.id ? (
                // Edit Mode
                <div className="comment-edit-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                  />
                  <div className="comment-edit-actions">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      className="btn-save"
                    >
                      ✓ Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <p className="comment-content">{comment.content}</p>
                  
                  {/* Show edit/delete buttons only for comment author */}
                  {user && user.id === comment.user_id && (
                    <div className="comment-actions">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="btn-edit-comment"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="btn-delete-comment"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
      )}

      <style>{`
        .login-prompt {
          background: rgba(218, 165, 32, 0.1);
          border: 2px dashed var(--border-gold);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin-bottom: 30px;
        }

        .login-prompt p {
          color: #b0b0b0;
          font-size: 1.1em;
          margin-bottom: 15px;
        }

        .comment {
          position: relative;
        }

        .comment-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .btn-edit-comment,
        .btn-delete-comment {
          padding: 4px 12px;
          font-size: 0.85rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
          color: #666;
          transition: all 0.2s;
        }

        .btn-edit-comment:hover {
          background: #f0f0f0;
          color: #333;
        }

        .btn-delete-comment:hover {
          background: #fee;
          color: #d00;
        }

        .comment-edit-form {
          margin-top: 10px;
        }

        .comment-edit-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }

        .comment-edit-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .btn-save,
        .btn-cancel {
          padding: 6px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-save {
          background: #28a745;
          color: white;
        }

        .btn-save:hover {
          background: #218838;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-cancel:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
}

export default CommentSection;