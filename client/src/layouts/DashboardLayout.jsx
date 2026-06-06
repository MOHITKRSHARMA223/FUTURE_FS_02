import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import CommandPalette from '../components/ui/CommandPalette';
import './DashboardLayout.css';

const pageTitles = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/calendar': 'Calendar',
  '/analytics': 'Analytics',
  '/ai-insights': 'AI Insights',
  '/settings': 'Settings',
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('crm-sidebar-collapsed') === 'true';
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'LeadFlow CRM';

  const toggleCollapse = () => {
    setSidebarCollapsed(prev => {
      localStorage.setItem('crm-sidebar-collapsed', String(!prev));
      return !prev;
    });
  };

  // Keyboard shortcut: Ctrl+K
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setCmdOpen(prev => !prev);
    }
    if (e.key === 'Escape') setCmdOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="dashboard-main">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          onSearchOpen={() => setCmdOpen(true)}
        />
        <main className="dashboard-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
