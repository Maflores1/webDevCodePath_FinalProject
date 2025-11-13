import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    category: 'General',
    author_name: '',
    is_mentor_post: false
  });

  const CATEGORIES = [
    'General',
    '🏠 Homesickness & Culture',
    '💰 Scholarships & Finance',
    '📚 Academic Balance',
    '🏋️ Training & Performance',
    '🗣️ Language & Communication',
    '🎓 Life After Sports',
    '❓ Ask a Mentor',
    '🎉 Wins & Celebrations'
  ];

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

      setFormData({
        title: data.title || '',
        content: data.content || '',
        image_url: data.image_url || '',
        category: data.category || 'General',
        author_name: data.author_name || '',
        is_mentor_post: data.is_mentor_post || false
      });
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Post not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please add a title for your post!');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title.trim(),
          content: formData.content.trim() || null,
          image_url: formData.image_url.trim() || null,
          category: formData.category,
          is_mentor_post: formData.is_mentor_post
        })
        .eq('id', id);

      if (error) throw error;

      alert('Post updated successfully! 🎉');
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  return (
    <div className="create-post-page">
      <div className="create-container">
        <h1>Edit Your Post ✏️</h1>
        <p className="create-subtitle">
          Update your post to keep the community informed
        </p>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Author Name</label>
            <input
              type="text"
              value={formData.author_name}
              disabled
              className="disabled-input"
            />
            <small>Author name cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Post Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength="200"
            />
            <small>{formData.title.length}/200 characters</small>
          </div>

          <div className="form-group">
            <label>Content (Optional)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="8"
            />
          </div>

          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_mentor_post"
                checked={formData.is_mentor_post}
                onChange={handleChange}
              />
              <span>✨ This is a mentor post</span>
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate(`/post/${id}`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;