import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    if (!newComment.trim() || !authorName.trim()) {
      alert('Please fill in both your name and comment');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          content: newComment.trim(),
          author_name: authorName.trim()
        }])
        .select();

      if (error) throw error;

      setComments(prev => [...prev, data[0]]);
      setNewComment('');
      // Keep author name for convenience
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 60;
    if (interval < 1) return "just now";
    if (interval < 60) return Math.floor(interval) + "m ago";
    
    interval = interval / 60;
    if (interval < 24) return Math.floor(interval) + "h ago";
    
    interval = interval / 24;
    return Math.floor(interval) + "d ago";
  };

  return (
    <div className="comments-section">
      <h2>💬 Comments ({comments.length})</h2>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="comment-author-input"
          required
        />
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a supportive comment..."
          rows="3"
          required
        />
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Posting...' : '💬 Post Comment'}
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
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
}

export default CommentSection;