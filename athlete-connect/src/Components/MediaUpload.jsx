import { useState } from 'react';
import { uploadMedia } from '../utils/mediaUpload';
import { showToast } from '../Components/Toast';

function MediaUpload({ onUploadComplete, currentMedia }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentMedia?.url || null);
  const [mediaType, setMediaType] = useState(currentMedia?.type || null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');

    setUploading(true);

    try {
      const result = await uploadMedia(file);
      onUploadComplete(result);
      showToast('Media uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast(error.message || 'Error uploading media', 'error');
      setPreview(null);
      setMediaType(null);
    } finally {
      setUploading(false);
    }
  };

  return (
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
        <div className="media-preview">
          {mediaType === 'video' ? (
            <video src={preview} controls style={{ maxWidth: '100%', borderRadius: '10px' }} />
          ) : (
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '10px' }} />
          )}
        </div>
      )}

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

        .media-preview {
          margin-top: 15px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default MediaUpload;