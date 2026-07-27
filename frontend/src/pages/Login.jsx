import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, LogIn, Loader } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://ancient-penguin-79.loca.lt/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      login(data.token, { username: data.username, role: data.role });
      navigate('/');
    } catch (err) {
      setError('Unable to connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decorative blobs */}
      <div style={styles.blobTopRight} />
      <div style={styles.blobBottomLeft} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <Activity size={36} color="#f59e0b" />
          <span style={styles.logoText}>Swastik Medical</span>
        </div>

        <h1 style={styles.heading}>Welcome Back</h1>
        <p style={styles.subheading}>Sign in to manage your store</p>

        {/* Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-password">Password</label>
            <div style={styles.passwordWrapper}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ ...styles.input, paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <><Loader size={18} style={styles.spin} /> Signing in…</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        {/* Hint */}
        <p style={styles.hint}>
          Create By Swastik Infotech
        </p>
      </div>
    </div>
  );
}

/* ── Inline styles (avoids CSS class conflicts) ── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#161412',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  blobTopRight: {
    position: 'absolute',
    top: '-120px',
    right: '-120px',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: '-150px',
    left: '-100px',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(217,119,6,0.1) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#1c1917',
    padding: '48px 40px',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoText: {
    color: '#fef3e2',
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  heading: {
    color: '#fef3e2',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subheading: {
    color: '#a8927a',
    fontSize: '15px',
    marginBottom: '36px',
    textAlign: 'center',
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#e7e5e4',
    fontSize: '14px',
    fontWeight: '500',
    marginLeft: '4px',
  },
  input: {
    width: '100%',
    background: '#292524',
    border: '1px solid #44403c',
    color: '#fef3e2',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: '#a8927a',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    background: '#f59e0b',
    color: '#451a03',
    padding: '15px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    border: 'none',
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
  },
  hint: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#a8927a',
  },
  spin: {
    animation: 'spin 1s linear infinite',
  }
};
