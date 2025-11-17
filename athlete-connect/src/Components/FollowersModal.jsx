import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function FollowersModal({ userId, type, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  const loadUsers = async () => {
    try {
      let query;
      
      if (type === 'followers') {
        // Get people who follow this user
        const { data, error } = await supabase
          .from('follows')
          .select(`
            follower_id,
            profiles:follower_id (
              id,
              full_name,
              avatar_url,
              sport,
              university,
              country
            )
          `)
          .eq('following_id', userId);

        if (error) throw error;
        setUsers(data.map(d => d.profiles));
      } else {
        // Get people this user follows
        const { data, error } = await supabase
          .from('follows')
          .select(`
            following_id,
            profiles:following_id (
              id,
              full_name,
              avatar_url,
              sport,
              university,
              country
            )
          `)
          .eq('follower_id', userId);

        if (error) throw error;
        setUsers(data.map(d => d.profiles));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (user) => {
    if (user.avatar_url) return user.avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&size=100&background=daa520&color=fff&bold=true`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === 'followers' ? 'Followers' : 'Following'}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : users.length > 0 ? (
            <div className="users-list">
              {users.map(user => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`}
                  className="user-item"
                  onClick={onClose}
                >
                  <img 
                    src={getAvatarUrl(user)} 
                    alt={user.full_name}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h3>{user.full_name}</h3>
                    <div className="user-details">
                      {user.sport && <span>🏅 {user.sport}</span>}
                      {user.university && <span>🎓 {user.university}</span>}
                      {user.country && <span>🌍 {user.country}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-users">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: var(--card-bg);
          border: 2px solid var(--border-gold);
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid var(--border-gold);
        }

        .modal-header h2 {
          color: var(--primary-gold);
          margin: 0;
          font-size: 1.5em;
        }

        .modal-close {
          background: none;
          border: none;
          color: #888;
          font-size: 2em;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .loading-text,
        .no-users {
          text-align: center;
          color: #888;
          padding: 40px 20px;
        }

        .users-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .user-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(218, 165, 32, 0.05);
          border: 1px solid var(--border-gold);
          border-radius: 12px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
        }

        .user-item:hover {
          background: rgba(218, 165, 32, 0.1);
          transform: translateX(5px);
          border-color: var(--primary-gold);
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid var(--primary-gold);
          object-fit: cover;
        }

        .user-info {
          flex: 1;
        }

        .user-info h3 {
          margin: 0 0 5px 0;
          color: white;
          font-size: 1.1em;
        }

        .user-details {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .user-details span {
          color: #888;
          font-size: 0.85em;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-height: 90vh;
          }

          .modal-header {
            padding: 20px;
          }

          .user-item {
            flex-direction: column;
            text-align: center;
          }

          .user-details {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default FollowersModal;