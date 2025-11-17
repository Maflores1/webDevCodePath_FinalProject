import { useState, useEffect } from 'react';

let showToastGlobal;

function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Expose the function globally
    showToastGlobal = (message, type = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
            {toast.type === 'warning' && '⚠️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)}
            className="toast-close"
          >
            ×
          </button>
        </div>
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          top: 80px;
          right: 80px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        }

        .toast {
          background: black;
          border: 2px solid;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          border-color: #4ade80;
          background: black;
        }

        .toast-error {
          border-color: #f87171;
          background: black;
        }

        .toast-info {
          border-color: #60a5fa;
          background: black;
        }

        .toast-warning {
          border-color: #fbbf24;
          background: black;
        }

        .toast-icon {
          font-size: 1.5em;
          flex-shrink: 0;
        }

        .toast-message {
          color: white;
          flex: 1;
          font-weight: 500;
        }

        .toast-close {
          background: none;
          border: none;
          color: #888;
          font-size: 1.5em;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        @media (max-width: 768px) {
        .toast-container {
          top: 100px;  
          left: 50%;   
          transform: translateX(-50%);
          right: auto;  
          max-width: 280px;   
          width: 90%;  
          gap: 8px;   
        }

        .toast {
          padding: 12px 14px; 
          font-size: 0.85em; 
          border-radius: 10px; 
        }

        .toast-icon {
          font-size: 1.2em;   
        }

        .toast-message {
          font-size: 0.85em;  
        }

        .toast-close {
          font-size: 1.2em;  
          width: 20px;
          height: 20px;
        }
      }
      `}</style>
    </div>
  );
}

// Export the toast function
export const showToast = (message, type = 'success') => {
  if (showToastGlobal) {
    showToastGlobal(message, type);
  }
};

export default Toast;