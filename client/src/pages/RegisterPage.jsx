import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/ui/PasswordInput';
import toast from 'react-hot-toast';
import './RegisterPage.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill all fields');
    }
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome aboard 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'AI-powered lead scoring',
    'Drag & drop pipeline',
    'Smart email templates',
    'Real-time analytics',
  ];

  return (
    <div className="register-page">
      {/* Animated background */}
      <div className="register-bg">
        <div className="register-bg-orb register-bg-orb-1" />
        <div className="register-bg-orb register-bg-orb-2" />
        <div className="register-bg-orb register-bg-orb-3" />
      </div>

      <div className="register-container">
        {/* Left side — features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="register-features"
        >
          <div className="register-features-logo">
            <div className="register-logo-icon"><Zap size={28} /></div>
            <h1 className="register-features-brand">LeadFlow</h1>
          </div>
          <h2 className="register-features-title">
            Start managing leads like a pro
          </h2>
          <p className="register-features-desc">
            Join thousands of sales teams using LeadFlow to close more deals.
          </p>
          <ul className="register-features-list">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <CheckCircle size={18} />
                <span>{f}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right side — form */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="register-card glass"
        >
          <h2 className="register-card-title">Create your account</h2>
          <p className="register-card-subtitle">Get started in seconds — no credit card required</p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label>Full Name</label>
              <div className="register-input-wrap">
                <User size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Email</label>
              <div className="register-input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              icon={Lock}
              showStrength
              showRules
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              icon={Lock}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}
            />

            <motion.button
              type="submit"
              className="register-submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
