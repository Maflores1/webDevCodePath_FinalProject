import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PostCard from '../Components/PostCard'

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterCategory, setFilterCategory] = useState('All');

  const CATEGORIES = [
    'All',
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

  // Load posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order(sortBy, { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order(newSort, { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error sorting posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero">
        <h1>Welcome to Athlete Connect</h1>
        <p className="hero-subtitle">
          A community where international student-athletes share experiences, 
          find support, and thrive together 🌍🏆
        </p>
      </div>

      {/* Stats Section */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{posts.length}</span>
          <span className="stat-label">Community Posts</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{posts.filter(p => p.is_mentor_post).length}</span>
          <span className="stat-label">Mentor Insights</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{posts.reduce((sum, p) => sum + p.upvotes, 0)}</span>
          <span className="stat-label">Total Upvotes</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="created_at">⏰ Newest First</option>
          <option value="upvotes">🔥 Most Upvoted</option>
        </select>
      </div>

      {/* Posts Feed */}
      <div className="posts-container">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={loadPosts} />
          ))
        ) : (
          <div className="no-posts">
            <h2>No posts found</h2>
            <p>Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;