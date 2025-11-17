import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header Section */}
        <div className="about-header">
          <h1>About Us</h1>
          <p className="about-tagline">
            Building bridges between international student-athletes
          </p>
        </div>

        {/* Founder Story */}
        <div className="about-content">
          <div className="founder-section">
            <div className="founder-image-container">
              <img 
                src="/mateo-founder.jpg" 
                alt="Mateo Flores - Founder" 
                className="founder-image"
              />
              <div className="founder-badge">
                <span className="flag">🇪🇨</span>
                <span>Founder & Tennis Player</span>
              </div>
            </div>

            <div className="founder-story">
              <h2>Hi! I'm Mateo Flores 👋</h2>
              
              <p>
                I'm from Ecuador, and I had the incredible opportunity to play four years of 
                college tennis in the USA - an experience that completely transformed my life 
                both as a player and as a person.
              </p>

              <p>
                During my journey, I faced many challenges that international student-athletes 
                encounter - from adapting to different playing styles and training methods, to 
                navigating cultural differences and academic pressures. I learned so much from 
                these experiences, and I realized how valuable it would be to have a platform 
                where international tennis players could share their stories and support each other.
              </p>

              <p className="highlight-text">
                My goal is to help other international students have a better, smoother experience 
                by creating this community where we can learn from each other's journeys, celebrate 
                our victories, and support each other through the challenges.
              </p>

              <p className="motto">
                <strong>Together, we're stronger! 🎾</strong>
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="mission-section">
            <h2>Our Mission 🎯</h2>
            <p>
              Athlete Connect exists to create a supportive community where international 
              student-athletes can:
            </p>
            <ul className="mission-list">
              <li>
                <span className="icon">🤝</span>
                <div>
                  <strong>Connect & Support</strong>
                  <p>Find mentors and peers who understand your unique journey</p>
                </div>
              </li>
              <li>
                <span className="icon">📚</span>
                <div>
                  <strong>Share Knowledge</strong>
                  <p>Learn from others' experiences with academics, training, and life abroad</p>
                </div>
              </li>
              <li>
                <span className="icon">💪</span>
                <div>
                  <strong>Overcome Challenges</strong>
                  <p>Get advice on homesickness, scholarships, language barriers, and more</p>
                </div>
              </li>
              <li>
                <span className="icon">🏆</span>
                <div>
                  <strong>Celebrate Success</strong>
                  <p>Share your wins, big and small, with people who truly understand</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Why This Matters */}
          <div className="why-section">
            <h2>Why This Matters 💙</h2>
            <p>
              Being an international student-athlete is an incredible privilege, but it comes 
              with unique challenges that many people don't understand. From managing homesickness 
              during tournament seasons to balancing rigorous training with academic demands in 
              a second language - these experiences can feel isolating.
            </p>
            <p>
              That's why this community exists. Here, you're not alone. Every story shared, 
              every piece of advice given, and every word of encouragement helps another athlete 
              navigate their journey with confidence.
            </p>
          </div>

          {/* Community Stats */}
          <div className="stats-highlight">
            <div className="stat-card">
              <span className="stat-icon">🌍</span>
              <h3>Global Community</h3>
              <p>Athletes from over 50 countries</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏅</span>
              <h3>Multiple Sports</h3>
              <p>Tennis, Soccer, Basketball & more</p>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✨</span>
              <h3>Mentor Network</h3>
              <p>Experienced athletes ready to help</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <h2>Ready to Join? 🚀</h2>
            <p>
              Whether you're just starting your journey or you're an experienced athlete 
              looking to give back, we'd love to have you in our community!
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', marginRight: '15px' }}>
                Join the Community
              </Link>
              <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
                Browse Stories
              </Link>
            </div>
          </div>

          {/* Contact Section */}
          <div className="contact-section">
            <h2>Get in Touch 📧</h2>
            <p>
              Have questions, suggestions, or just want to say hi? I'd love to hear from you!
            </p>
            <p className="contact-info">
              <strong>Email:</strong> usarecruited@gmail.com<br />
              <strong>Follow:</strong> @usarecruited_ on Instagram
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .about-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .about-container {
          background: var(--card-bg);
          border: 1px solid var(--border-gold);
          border-radius: 20px;
          padding: 40px;
        }

        .about-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 2px solid var(--border-gold);
        }

        .about-header h1 {
          background: linear-gradient(45deg, var(--primary-gold), var(--light-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2.5em;
          margin-bottom: 15px;
        }

        .about-tagline {
          color: #b0b0b0;
          font-size: 1.2em;
          margin-top: 10px;
        }

        .about-content {
          color: #e0e0e0;
          line-height: 1.8;
        }

        .founder-section {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
          margin-bottom: 50px;
          align-items: start;
        }

        .founder-image-container {
          top: 100px;
        }

        .founder-image {
          width: 100%;
          border-radius: 20px;
          margin-bottom: 15px;
          box-shadow: 0 8px 20px rgba(218, 165, 32, 0.3);
        }

        .founder-badge {
          background: rgba(218, 165, 32, 0.1);
          border: 1px solid var(--border-gold);
          border-radius: 10px;
          padding: 12px;
          text-align: center;
          color: #b0b0b0;
        }

        .founder-badge .flag {
          font-size: 2em;
          display: block;
          margin-bottom: 5px;
        }

        .founder-story h2 {
          color: var(--primary-gold);
          margin-bottom: 20px;
          font-size: 1.8em;
        }

        .founder-story p {
          margin-bottom: 20px;
          line-height: 1.8;
          font-size: 1.05em;
        }

        .highlight-text {
          background: rgba(218, 165, 32, 0.1);
          border-left: 4px solid var(--primary-gold);
          padding: 20px;
          border-radius: 8px;
          font-size: 1.05em;
          margin: 30px 0;
        }

        .motto {
          text-align: center;
          font-size: 1.3em;
          color: var(--primary-gold);
          margin-top: 30px;
          padding: 20px;
          background: rgba(218, 165, 32, 0.05);
          border-radius: 10px;
        }

        .mission-section,
        .why-section {
          margin: 50px 0;
        }

        .mission-section h2,
        .why-section h2 {
          color: var(--primary-gold);
          margin-bottom: 20px;
          font-size: 1.8em;
        }

        .mission-section p,
        .why-section p {
          font-size: 1.05em;
          margin-bottom: 20px;
        }

        .mission-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 25px;
          margin-top: 30px;
        }

        .mission-list li {
          gap: 20px;
          align-items: flex-start;
          background: rgba(218, 165, 32, 0.05);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-gold);
          transition: all 0.3s ease;
        }

        .mission-list li:hover {
          background: rgba(218, 165, 32, 0.1);
          transform: translateX(5px);
        }

        .mission-list .icon {
          font-size: 2em;
          flex-shrink: 0;
        }

        .mission-list strong {
          color: var(--primary-gold);
          display: block;
          margin-bottom: 5px;
          font-size: 1.1em;
        }

        .mission-list p {
          color: #b0b0b0;
          margin: 0;
          line-height: 1.6;
        }

        .stats-highlight {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 50px 0;
        }

        .stat-card {
          background: rgba(218, 165, 32, 0.05);
          border: 1px solid var(--border-gold);
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(218, 165, 32, 0.1);
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(218, 165, 32, 0.3);
        }

        .stat-icon {
          font-size: 3em;
          display: block;
          margin-bottom: 15px;
        }

        .stat-card h3 {
          color: var(--primary-gold);
          margin: 10px 0;
          font-size: 1.3em;
        }

        .stat-card p {
          color: #888;
          margin: 0;
        }

        .cta-section {
          text-align: center;
          margin: 60px 0;
          padding: 40px;
          background: linear-gradient(135deg, rgba(218, 165, 32, 0.1), rgba(255, 215, 0, 0.05));
          border-radius: 20px;
          border: 1px solid var(--border-gold);
        }

        .cta-section h2 {
          color: var(--primary-gold);
          margin-bottom: 15px;
          font-size: 2em;
        }

        .cta-section p {
          font-size: 1.1em;
          margin-bottom: 30px;
        }

        .cta-buttons {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .contact-section {
          background: rgba(0, 0, 0, 0.3);
          padding: 30px;
          border-radius: 15px;
          border-left: 4px solid var(--primary-gold);
          margin-top: 50px;
        }

        .contact-section h2 {
          color: var(--primary-gold);
          margin-bottom: 15px;
          font-size: 1.6em;
        }

        .contact-section p {
          margin-bottom: 15px;
        }

        .contact-info {
          color: #b0b0b0;
          line-height: 1.8;
          margin-top: 15px;
          font-size: 1.05em;
        }

        .contact-info strong {
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .about-container {
            padding: 25px;
          }

          .about-header h1 {
            font-size: 2em;
          }

          .founder-section {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .founder-image-container {
            max-width: 1080px;
          }

          .stats-highlight {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .cta-buttons a {
            width: 100%;
            text-align: center;
          }

          .mission-list li {
            flex-direction: column;
            text-align: center;
          }
        }

        /* Animation */
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

        .about-page {
          animation: fadeIn 0.5s ease;
        }
      `}</style>
    </div>
  );
}

export default About;