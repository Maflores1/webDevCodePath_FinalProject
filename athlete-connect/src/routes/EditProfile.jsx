import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia } from '../utils/mediaUpload';
import { showToast } from '../Components/Toast';

function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    sport: '',
    university: '',
    country: '',
    graduation_year: '',
    instagram: '',
    linkedin: '',
    avatar_url: '',
    is_mentor: false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        sport: profile.sport || '',
        university: profile.university || '',
        country: profile.country || '',
        graduation_year: profile.graduation_year || '',
        instagram: profile.instagram || '',
        linkedin: profile.linkedin || '',
        avatar_url: profile.avatar_url || '',
        is_mentor: profile.is_mentor || false
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      showToast('Profile Updated successfully!', 'success');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploadingAvatar(true);

    try {
        const result = await uploadMedia(file); // same utility from CreatePost
        setFormData(prev => ({
        ...prev,
        avatar_url: result.url
        }));
        showToast('Profile picture uploaded!', 'success');
    } catch (error) {
        console.error('Avatar upload error:', error);
        showToast(error.message || 'Error uploading profile picture', 'error');
        setAvatarPreview(null);
    } finally {
        setUploadingAvatar(false);
    }
    };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const SPORTS = [
    'Tennis', 'Soccer', 'Basketball', 'Volleyball', 'Swimming',
    'Track & Field', 'Golf', 'Baseball', 'Softball', 'Wrestling',
    'Cross Country', 'Lacrosse', 'Other'
  ];

  const COUNTRIES = [
    'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile',
    'Colombia', 'Ecuador', 'France', 'Germany', 'India', 'Italy',
    'Japan', 'Mexico', 'Netherlands', 'New Zealand', 
    'Peru', 'Spain', 'Switzerland',
    'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Other'
  ];

  return (
    <div className="create-post-page">
      <div className="create-container">
        <h1>Edit Your Profile ✨</h1>
        <p className="create-subtitle">
          Help others get to know you better and connect with athletes who share your experiences
        </p>

        <form onSubmit={handleSubmit} className="create-form">
          {/* Basic Info */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
            <small>This is how you'll appear to the community</small>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself, your journey, and what you're passionate about..."
              rows="4"
              maxLength="500"
            />
            <small>{formData.bio.length}/500 characters - Share your story!</small>
          </div>

          {/* Athletic Info */}
          <div className="form-group">
            <label>Sport</label>
            <select
              name="sport"
              value={formData.sport}
              onChange={handleChange}
            >
              <option value="">Select your sport...</option>
              {SPORTS.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <small>What sport do you compete in?</small>
          </div>

          <div className="form-group">
            <label>University</label>
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="e.g., University of California, Berkeley"
            />
            <small>Where are you studying?</small>
          </div>

          <div className="form-group">
            <label>Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="">Select your country...</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <small>Where are you from?</small>
          </div>

          <div className="form-group">
            <label>Graduation Year</label>
            <select
              name="graduation_year"
              value={formData.graduation_year}
              onChange={handleChange}
            >
              <option value="">Select year...</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <small>When do you graduate?</small>
          </div>

          {/* Social Media */}
          <div className="form-group">
            <label>Instagram Username</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="username (without @)"
            />
            <small>Just the username, we'll add the @ and link automatically</small>
          </div>

          <div className="form-group">
            <label>LinkedIn Profile URL</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            <small>Full LinkedIn profile URL</small>
          </div>

          {/* Avatar URL */}
          <div className="form-group">
            <label>Upload Profile Picture</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
            />
            <small>Choose a photo from your device</small>

            {(avatarPreview || formData.avatar_url) && (
                <div className="image-preview" style={{ marginTop: '15px', textAlign: 'center' }}>
                <img
                    src={avatarPreview || formData.avatar_url}
                    alt="Profile preview"
                    style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid var(--primary-gold)'
                    }}
                />
                </div>
            )}
            </div>

          {/* Mentor Status */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_mentor"
                checked={formData.is_mentor}
                onChange={handleChange}
              />
              <span>✨ I want to be a mentor and help other athletes</span>
            </label>
            <small>Mentors get a special badge and their posts are highlighted to help others</small>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '💾 Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .create-post-page {
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @media (max-width: 768px) {
          .create-container {
            padding: 25px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default EditProfile;