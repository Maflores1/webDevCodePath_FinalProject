import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../Components/Toast';

function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match! 🔒', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters! 🔑', 'info');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      showToast('Welcome to Athlete Connect! Please check your email to verify your account.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error);
      showToast(error.message || 'Error creating account. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Join Athlete Connect 🏅</h1>
          <p className="auth-subtitle">
            Connect with international student-athletes worldwide and share your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g., Maria Rodriguez"
              required
            />
            <small>This is how you'll appear to the community</small>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@university.edu"
              required
            />
            <small>Use your university email if possible</small>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? '⏳ Creating Account...' : '🚀 Create My Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? {' '}
            <Link to="/login">Sign in here</Link>
          </p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;