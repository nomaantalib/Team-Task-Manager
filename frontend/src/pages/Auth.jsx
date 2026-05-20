import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';

const Auth = ({ onAuthSuccess, onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onAuthSuccess();
          }, 1000);
        } else {
          setError(result.message || 'Invalid email or password.');
        }
      } else {
        const result = await register(name, email, password, role);
        if (result.success) {
          setSuccess('Registration successful! Setting up workspace...');
          setTimeout(() => {
            onAuthSuccess();
          }, 1000);
        } else {
          setError(result.message || 'Registration failed. Try a different email.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card" style={{ zIndex: 10 }}>
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
          <button 
            onClick={onBackToLanding}
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            ← Back
          </button>
        </div>

        <div className="auth-header">
          <div className="auth-logo">
            <span>⚡ Antigravity AI</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin 
              ? 'AI-Powered Team Productivity & Smart Task Scheduling' 
              : 'Setup your workspace & invite team members'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="you@company.com"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Workspace Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`btn ${role === 'member' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '12px', fontSize: '0.85rem' }}
                >
                  <User size={16} /> Team Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '12px', fontSize: '0.85rem' }}
                >
                  <Shield size={16} /> Project Admin
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px', textAlign: 'center' }}>
                {role === 'admin' 
                  ? 'Admins can create projects, invite members, and allocate budgets.' 
                  : 'Members can update tasks, check off subtasks, and track workload.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
          >
            {loading ? 'Processing...' : isLogin ? 'Access Platform' : 'Create Account'} 
            {!loading && <ArrowRight size={18} style={{ marginLeft: '4px' }} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already registered? '}
          </span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
