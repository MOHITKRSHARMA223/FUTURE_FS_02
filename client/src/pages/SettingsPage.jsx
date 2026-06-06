import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Palette, Lock, Bell, Shield, Monitor, Moon, Sun, Sparkles,
} from 'lucide-react';
import Card from '../components/ui/Card';
import PasswordInput from '../components/ui/PasswordInput';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './SettingsPage.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const SettingsPage = () => {
  const { theme, setTheme, themes } = useTheme();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error('Fill all fields');
    if (newPassword.length < 8) return toast.error('Min 8 characters');
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const themeIcons = { light: <Sun size={18} />, dark: <Moon size={18} />, midnight: <Sparkles size={18} /> };
  const themeLabels = { light: 'Light', dark: 'Dark', midnight: 'Midnight' };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="settings-page">
      <div className="settings-header">
        <h2 className="settings-title"><SettingsIcon size={22} /> Settings</h2>
      </div>

      {/* Profile */}
      <motion.div variants={item}>
        <Card className="settings-card">
          <h3 className="settings-card-title"><User size={18} /> Profile</h3>
          <div className="settings-profile">
            <div className="settings-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="settings-profile-info">
              <h4>{user?.name}</h4>
              <p>{user?.email}</p>
              <span className="settings-role-badge">{user?.role}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div variants={item}>
        <Card className="settings-card">
          <h3 className="settings-card-title"><Palette size={18} /> Appearance</h3>
          <p className="settings-desc">Choose your preferred theme</p>
          <div className="settings-themes">
            {themes.map((t) => (
              <button
                key={t}
                className={`settings-theme-btn ${theme === t ? 'settings-theme-active' : ''}`}
                onClick={() => setTheme(t)}
              >
                {themeIcons[t]}
                <span>{themeLabels[t]}</span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item}>
        <Card className="settings-card">
          <h3 className="settings-card-title"><Bell size={18} /> Notifications</h3>
          <div className="settings-toggle-list">
            {['Email Notifications', 'Follow-up Reminders', 'Lead Conversion Alerts', 'System Updates'].map((label) => (
              <div key={label} className="settings-toggle-item">
                <span>{label}</span>
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div variants={item}>
        <Card className="settings-card">
          <h3 className="settings-card-title"><Lock size={18} /> Change Password</h3>
          <form onSubmit={handlePasswordChange} className="settings-form">
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              icon={Lock}
            />
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              icon={Lock}
              showStrength
              showRules
            />
            <button type="submit" className="settings-save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </Card>
      </motion.div>

      {/* Security Extra */}
      <motion.div variants={item}>
        <Card className="settings-card">
          <h3 className="settings-card-title"><Shield size={18} /> Security</h3>
          <div className="settings-toggle-list">
            <div className="settings-toggle-item">
              <div>
                <span>Two-Factor Authentication</span>
                <p className="settings-toggle-desc">Add an extra layer of security to your account</p>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" />
                <span className="settings-toggle-slider" />
              </label>
            </div>
            <div className="settings-toggle-item">
              <div>
                <span>Login Notifications</span>
                <p className="settings-toggle-desc">Get notified when someone logs into your account</p>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-slider" />
              </label>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div variants={item}>
        <Card className="settings-card">
          <h3 className="settings-card-title"><Monitor size={18} /> About</h3>
          <div className="settings-about">
            <div className="settings-about-item"><span>Version</span><span>2.0.0</span></div>
            <div className="settings-about-item"><span>Stack</span><span>MERN + AI</span></div>
            <div className="settings-about-item"><span>License</span><span>MIT</span></div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
