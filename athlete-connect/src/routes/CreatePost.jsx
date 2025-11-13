import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function CreatePost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Please add a title for your post!');
      return;
    }

    if (!formData.author_name.trim()) {
      alert('Please enter your name or use "Anonymous"');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: formData.title.trim(),
          content: formData.content.trim() || null,
          image_url: formData.image_url.trim() || null,
          category: formData.category,
          author_name: formData.author_name.trim(),
          is_mentor_post: formData.is_mentor_post,
          upvotes: 0
        }])
        .select();

      if (error) throw error;

      alert('Post created successfully! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-container">
        <h1>Share Your Experience 📝</h1>
        <p className="create-subtitle">
          Your story could help another athlete feel less alone. Share your experiences, 
          ask questions, or offer advice to the community.
        </p>

        <form onSubmit={handleSubmit} className="create-form">
          {/* Author Name */}
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              placeholder="Enter your name or 'Anonymous'"
              required
            />
            <small>This will be visible on your post</small>
          </div>

          {/* Category */}
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
            <small>Help others find your post</small>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Post Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., How I dealt with homesickness my first semester"
              required
              maxLength="200"
            />
            <small>{formData.title.length}/200 characters</small>
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Content (Optional)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your story, ask a question, or offer advice..."
              rows="8"
            />
            <small>Add details to help the community understand your experience</small>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <small>Add an image to make your post stand out</small>
            
            {formData.image_url && (
              <div className="image-preview">
                <img src={formData.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Mentor Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_mentor_post"
                checked={formData.is_mentor_post}
                onChange={handleChange}
              />
              <span>✨ This is a mentor post (I'm sharing advice/guidance)</span>
            </label>
            <small>Check this if you're an experienced athlete offering guidance</small>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Posting...' : '🚀 Post to Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;