import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/ui/PasswordInput';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Animated mesh background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
        <div className="login-bg-orb login-bg-orb-4" />
        <div className="login-grid-overlay" />
      </div>

      <div className="login-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="login-card"
        >
          {/* Top glow */}
          <div className="login-card-glow" />

          {/* Logo */}
          <div className="login-header">
            <motion.div
              className="login-logo-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
            >
              <Zap size={22} />
            </motion.div>
            <h1 className="login-brand">LeadFlow</h1>
            <p className="login-subtitle">Sign in to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className="login-input-wrap">
                <Mail size={17} className="login-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={Lock}
            />

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" defaultChecked />
                <span className="login-checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            <motion.button
              type="submit"
              className="login-submit"
              disabled={loading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          {/* Create account */}
          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Get started free</Link></p>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="login-trust"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="login-trust-item">
            <ShieldCheck size={14} />
            <span>256-bit SSL encrypted</span>
          </div>
          <span className="login-trust-dot" />
          <div className="login-trust-item">
            <Lock size={14} />
            <span>JWT secured authentication</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
