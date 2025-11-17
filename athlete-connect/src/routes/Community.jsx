import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../Components/Toast';

function Community() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [following, setFollowing] = useState(new Set());

  useEffect(() => {
    loadAthletes();
    if (user) {
      loadFollowing();
    }
  }, [user]);

  const loadAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .order('followers_count', { ascending: false });

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Error loading athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowing(new Set(data.map(f => f.following_id)));
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const handleFollow = async (athleteId) => {
    if (!user) {
      showToast('Please log in first', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('follows')
        .insert([{
          follower_id: user.id,
          following_id: athleteId
        }]);

      if (error) throw error;

      setFollowing(prev => new Set([...prev, athleteId]));
      loadAthletes(); // Refresh counts
      showToast('Successfully followed!', 'success');
    } catch (error) {
      console.error('Error following:', error);
      showToast('Error following user', 'error');
    }
  };

  const handleUnfollow = async (athleteId) => {
    if (!user) return;

    if (!window.confirm('Unfollow this athlete?')) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', athleteId);

      if (error) throw error;

      const newFollowing = new Set(following);
      newFollowing.delete(athleteId);
      setFollowing(newFollowing);
      loadAthletes(); // Refresh counts
      showToast('Successfully Unfollowed!', 'success');
    } catch (error) {
      console.error('Error unfollowing:', error);
      showToast('Error unfollowing user', 'error');
    }
  };

  // Get unique sports and countries for filters
  const sports = ['All', ...new Set(athletes.map(a => a.sport).filter(Boolean))];
  const countries = ['All', ...new Set(athletes.map(a => a.country).filter(Boolean))];

  // Filter athletes
  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (athlete.university && athlete.university.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = filterSport === 'All' || athlete.sport === filterSport;
    const matchesCountry = filterCountry === 'All' || athlete.country === filterCountry;
    
    return matchesSearch && matchesSport && matchesCountry;
  });

  if (loading) {
    return <div className="loading">Loading community...</div>;
  }

  return (
    <div className="community-page">
      {/* Header */}
      <div className="community-header">
        <h1>🌍 Discover Athletes</h1>
        <p className="community-subtitle">
          Connect with international student-athletes from around the world
        </p>
      </div>

      {/* Stats Banner */}
      <div className="community-stats">
        <div className="stat-card">
          <h3>{athletes.length}</h3>
          <p>Athletes</p>
        </div>
        <div className="stat-card">
          <h3>{sports.length - 1}</h3>
          <p>Sports</p>
        </div>
        <div className="stat-card">
          <h3>{countries.length - 1}</h3>
          <p>Countries</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="community-controls">
        <input
          type="text"
          placeholder="🔍 Search by name or university..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterSport}
          onChange={(e) => setFilterSport(e.target.value)}
          className="filter-select"
        >
          {sports.map(sport => (
            <option key={sport} value={sport}>{sport === 'All' ? '🏅 All Sports' : sport}</option>
          ))}
        </select>

        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="filter-select"
        >
          {countries.map(country => (
            <option key={country} value={country}>{country === 'All' ? '🌍 All Countries' : country}</option>
          ))}
        </select>
      </div>

      {/* Athletes Grid */}
      <div className="athletes-grid">
        {filteredAthletes.map(athlete => (
          <div key={athlete.id} className="athlete-card">
            <Link to={`/profile/${athlete.id}`} className="athlete-link">
              <img
                src={athlete.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(athlete.full_name)}&size=200&background=daa520&color=fff`}
                alt={athlete.full_name}
                className="athlete-avatar"
              />
              
              <div className="athlete-info">
                <h3>{athlete.full_name}</h3>
                
                <div className="athlete-badges">
                  {athlete.is_mentor && (
                    <span className="badge-mentor">✨ Mentor</span>
                  )}
                  {athlete.sport && (
                    <span className="badge-sport">🏅 {athlete.sport}</span>
                  )}
                </div>

                {athlete.university && (
                  <p className="athlete-university">🎓 {athlete.university}</p>
                )}
                {athlete.country && (
                  <p className="athlete-country">🌍 {athlete.country}</p>
                )}

                <div className="athlete-stats">
                  <span>{athlete.posts_count} posts</span>
                  <span>{athlete.followers_count} followers</span>
                  <span>{athlete.following_count} following</span>
                </div>
              </div>
            </Link>

            {/* Follow Button */}
            {user && athlete.id !== user.id && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  following.has(athlete.id) ? handleUnfollow(athlete.id) : handleFollow(athlete.id);
                }}
                className={following.has(athlete.id) ? 'btn-following' : 'btn-follow'}
              >
                {following.has(athlete.id) ? '✓ Following' : '+ Follow'}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="no-results">
          <h2>No athletes found</h2>
          <p>Try adjusting your filters</p>
        </div>
      )}

      <style>{`
        .community-page {
          max-width: 1200px;
          margin: 0 auto;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .community-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 30px;
          background: linear-gradient(135deg, rgba(218, 165, 32, 0.1), rgba(255, 215, 0, 0.05));
          border-radius: 20px;
          border: 1px solid var(--border-gold);
        }

        .community-header h1 {
          color: var(--primary-gold);
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .community-subtitle {
          color: #b0b0b0;
          font-size: 1.1em;
        }

        .community-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--border-gold);
          border-radius: 15px;
          padding: 25px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(218, 165, 32, 0.3);
        }

        .stat-card h3 {
          color: var(--primary-gold);
          font-size: 2.5em;
          margin: 0 0 5px 0;
        }

        .stat-card p {
          color: #888;
          margin: 0;
        }

        .community-controls {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .athletes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .athlete-card {
          background: var(--card-bg);
          border: 1px solid var(--border-gold);
          border-radius: 15px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
        }

        .athlete-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-gold);
          box-shadow: 0 8px 25px rgba(218, 165, 32, 0.3);
        }

        .athlete-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .athlete-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid var(--primary-gold);
          margin: 0 auto 15px;
          display: block;
          object-fit: cover;
        }

        .athlete-info {
          text-align: center;
        }

        .athlete-info h3 {
          color: white;
          margin: 10px 0;
          font-size: 1.2em;
        }

        .athlete-badges {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin: 10px 0;
          flex-wrap: wrap;
        }

        .badge-mentor {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          color: white;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8em;
        }

        .badge-sport {
          background: rgba(218, 165, 32, 0.2);
          color: var(--primary-gold);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8em;
          border: 1px solid var(--border-gold);
        }

        .athlete-university,
        .athlete-country {
          color: #b0b0b0;
          font-size: 0.9em;
          margin: 5px 0;
        }

        .athlete-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-gold);
          font-size: 0.85em;
          color: #888;
        }

        .btn-follow,
        .btn-following {
          width: 100%;
          padding: 10px;
          margin-top: 15px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-follow {
          background: var(--primary-gold);
          color: #000;
        }

        .btn-follow:hover {
          background: var(--light-gold);
          transform: scale(1.02);
        }

        .btn-following {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border: 1px solid #4ade80;
        }

        .btn-following:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border-color: #f87171;
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #b0b0b0;
        }

        .no-results h2 {
          color: white;
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .community-stats {
            grid-template-columns: 1fr;
          }

          .athletes-grid {
            grid-template-columns: 1fr;
          }

          .community-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default Community;