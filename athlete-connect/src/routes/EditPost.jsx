import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { uploadMedia, deleteMedia } from '../utils/mediaUpload'
import { showToast } from '../Components/Toast';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    is_mentor_post: false
  });

  const [mediaData, setMediaData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [oldMediaPath, setOldMediaPath] = useState(null);

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

      // Check if user owns this post
      if (data.user_id !== user?.id) {
        showToast('You can only edit your own posts!', 'info');
        navigate('/');
        return;
      }

      setFormData({
        title: data.title || '',
        content: data.content || '',
        category: data.category || 'General',
        is_mentor_post: data.is_mentor_post || false
      });

      // Set existing media if any
      if (data.video_url) {
        setPreview(data.video_url);
        setMediaData({ url: data.video_url, type: 'video' });
      } else if (data.image_url) {
        setPreview(data.image_url);
        setMediaData({ url: data.image_url, type: 'image' });
      }

    } catch (error) {
      console.error('Error loading post:', error);
      showToast('Post not found', 'error');
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

  const handleRemoveMedia = () => {
    setPreview(null);
    setMediaData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Please add a title for your post!', 'info');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        category: formData.category,
        is_mentor_post: formData.is_mentor_post
      };

      // Handle media updates
      if (mediaData) {
        if (mediaData.type === 'video') {
          updateData.video_url = mediaData.url;
          updateData.image_url = null;
          updateData.media_type = 'video';
        } else {
          updateData.image_url = mediaData.url;
          updateData.video_url = null;
          updateData.media_type = 'image';
        }
      } else {
        // User removed media
        updateData.image_url = null;
        updateData.video_url = null;
        updateData.media_type = 'none';
      }

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      showToast('Post updated successfully!', 'success');
      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      showToast('Error updating post. Please try again.', 'error');
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
          </div>

          {/* Title */}
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

          {/* Content */}
          <div className="form-group">
            <label>Content (Optional)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="8"
            />
          </div>

          {/* Media Upload/Edit */}
          <div className="form-group">
            <label>Image or Video</label>
            
            {preview ? (
              <div className="media-preview-container">
                <div className="media-preview">
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
                <div className="media-actions">
                  <button 
                    type="button" 
                    onClick={handleRemoveMedia}
                    className="btn-delete"
                    style={{ marginTop: '10px' }}
                  >
                    🗑️ Remove Media
                  </button>
                </div>
              </div>
            ) : (
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
                  {uploading ? '⏳ Uploading...' : '📎 Upload New Image/Video'}
                </label>
              </div>
            )}
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
              <span>✨ This is a mentor post</span>
            </label>
          </div>

          {/* Submit Buttons */}
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
              disabled={saving || uploading}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .media-upload {
          margin: 15px 0;
        }

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

        .media-preview-container {
          margin: 15px 0;
        }

        .media-preview {
          text-align: center;
          margin-bottom: 10px;
        }

        .media-actions {
          text-align: center;
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          color: #b0b0b0;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--primary-gold);
        }

        .checkbox-label span {
          font-weight: 600;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default EditPost;