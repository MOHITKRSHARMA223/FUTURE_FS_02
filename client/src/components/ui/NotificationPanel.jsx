import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import api from '../../services/api';
import './NotificationPanel.css';

const NotificationPanel = ({ onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      onCountChange?.(notifications.filter(n => !n.read && n._id !== id).length);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onCountChange?.(0);
    } catch {}
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="notif-panel glass"
    >
      <div className="notif-header">
        <h3>Notifications</h3>
        {unread > 0 && (
          <button className="notif-mark-all" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="notif-list">
        {loading ? (
          <div className="notif-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={24} />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
              onClick={() => !n.read && markAsRead(n._id)}
            >
              <div className="notif-dot-wrap">
                {!n.read && <span className="notif-dot" />}
              </div>
              <div className="notif-content">
                <p className="notif-title">{n.title}</p>
                <p className="notif-message">{n.message}</p>
                <span className="notif-time">{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default NotificationPanel;
