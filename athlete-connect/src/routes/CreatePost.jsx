import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { uploadMedia } from '../utils/mediaUpload'
import { showToast } from '../Components/Toast';
import { notifyFollowersNewPost } from '../services/notificationService';

function CreatePost() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    is_mentor_post: false
  });

  const [mediaData, setMediaData] = useState(null);
  const [preview, setPreview] = useState(null);

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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setUploading(true);

    try {
      const result = await uploadMedia(file);
      setMediaData(result);
      showToast('Media uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast(error.message || 'Error uploading media', 'error');
      setPreview(null);
      setMediaData(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please add a title for your post!', 'info');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        category: formData.category,
        author_name: profile?.full_name || 'Anonymous',
        user_id: user.id,
        is_mentor_post: formData.is_mentor_post,
        upvotes: 0
      };

      // Add media data if uploaded
      if (mediaData) {
        if (mediaData.type === 'video') {
          postData.video_url = mediaData.url;
          postData.media_type = 'video';
        } else {
          postData.image_url = mediaData.url;
          postData.media_type = 'image';
        }
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select();

      if (error) throw error;

      // Notify followers about new post
      if (data && data[0] && profile) {
      notifyFollowersNewPost(
        user.id,
        profile.full_name,
        data[0].title,  // Changed from data.title
        data[0].id      // Changed from data.id
      ).catch(err => console.error('Failed to notify followers:', err));
    }

      showToast('Post created successfully!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Error creating post. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-container">
        <h1>Share Your Experience</h1>
        <p className="create-subtitle">
          Your story could help another athlete feel less alone. Share your experiences, 
          ask questions, or offer advice to the community.
        </p>

        <form onSubmit={handleSubmit} className="create-form">
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

          {/* Media Upload */}
          <div className="form-group">
            <label>Add Image or Video (Optional)</label>
            <div className="media-upload">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={uploading}
                id="media-upload-input"
                style={{ display: 'none' }}
              />
              
              <label htmlFor="media-upload-input" className="upload-button">
                {uploading ? '⏳ Uploading...' : '📎 Upload Image/Video'}
              </label>

              {preview && (
                <div className="media-preview" style={{ marginTop: '15px' }}>
                  {mediaData?.type === 'video' ? (
                    <video 
                      src={preview} 
                      controls 
                      style={{ maxWidth: '100%', borderRadius: '10px', border: '2px solid var(--primary-gold)' }}
                    />
                  ) : (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', borderRadius: '10px', border: '2px solid var(--primary-gold)' }}
                    />
                  )}
                </div>
              )}
            </div>
            <small>Supported: Images (JPG, PNG, GIF, WebP - max 5MB) or Videos (MP4, WebM - max 50MB)</small>
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
              disabled={loading || uploading}
            >
              {loading ? 'Posting...' : '🚀 Post to Community'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .upload-button {
          display: inline-block;
          padding: 12px 24px;
          background: rgba(218, 165, 32, 0.1);
          border: 2px dashed var(--primary-gold);
          border-radius: 10px;
          color: var(--primary-gold);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .upload-button:hover {
          background: rgba(218, 165, 32, 0.2);
          transform: scale(1.02);
        }

        h1 {
        line-height: 1.1;
      }
      `}</style>
    </div>
  );
}

export default CreatePost;