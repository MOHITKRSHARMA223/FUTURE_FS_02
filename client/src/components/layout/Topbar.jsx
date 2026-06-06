import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search, Command } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../ui/NotificationPanel';
import api from '../../services/api';
import './Topbar.css';

const Topbar = ({ onMenuClick, title, onSearchOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.data.count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const themeIcon = theme === 'light' ? <Moon size={19} /> : <Sun size={19} />;

  return (
    <header className="topbar frosted">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-center">
        <button className="topbar-search-btn" onClick={onSearchOpen}>
          <Search size={16} />
          <span>Search...</span>
          <kbd>⌘K</kbd>
        </button>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title={`Theme: ${theme}`}>
          {themeIcon}
        </button>

        <div className="topbar-notif-wrapper">
          <button className="topbar-icon-btn" onClick={() => setShowNotifs(!showNotifs)} aria-label="Notifications">
            <Bell size={19} />
            {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
          </button>
          {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} onCountChange={setUnreadCount} />}
        </div>

        <div className="topbar-avatar">
          <span>{user?.name?.charAt(0) || 'A'}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
