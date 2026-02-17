import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'editor') => {
    if (role === 'admin') {
      setEmail('admin@contenthub.com');
      setPassword('admin123');
    } else {
      setEmail('editor@contenthub.com');
      setPassword('editor123');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Zap size={32} />
          </div>
          <h1>ContentHub</h1>
          <p>Sign in to your admin panel</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner small" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-demo">
          <p>Quick demo access:</p>
          <div className="demo-buttons">
            <button className="btn btn-outline btn-sm" onClick={() => fillDemo('admin')}>
              Admin Account
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => fillDemo('editor')}>
              Editor Account
            </button>
          </div>
        </div>
      </div>

      <div className="login-bg">
        <div className="login-bg-content">
          <h2>Modern Content Management</h2>
          <p>
            Manage your articles, categories, media, and users with an elegant,
            professional-grade admin panel.
          </p>
          <div className="login-features">
            <div className="login-feature">✦ Rich Markdown Editor</div>
            <div className="login-feature">✦ Media Library</div>
            <div className="login-feature">✦ Role-Based Access</div>
            <div className="login-feature">✦ Analytics Dashboard</div>
          </div>
        </div>
      </div>
    </div>
  );
}
