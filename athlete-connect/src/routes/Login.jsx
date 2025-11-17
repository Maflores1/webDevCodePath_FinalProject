import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../Components/Toast';

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      showToast('Welcome back!', 'info');
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      if (error.message.includes('Invalid login credentials')) {
        showToast('Invalid email or password. Please try again.', 'error');
      } else if (error.message.includes('Email not confirmed')) {
        showToast('Please check your email and verify your account first!', 'info');
      } else {
        showToast('Error signing in: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back! 👋</h1>
          <p className="auth-subtitle">
            Sign in to connect with your community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@university.edu"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? '⏳ Signing In...' : '🔓 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? {' '}
            <Link to="/register">Create one here</Link>
          </p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;