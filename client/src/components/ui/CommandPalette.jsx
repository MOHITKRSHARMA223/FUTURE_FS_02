import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, LayoutDashboard, Users, BarChart3, Kanban, Calendar, Brain, Settings, X } from 'lucide-react';
import api from '../../services/api';
import './CommandPalette.css';

const pages = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Pipeline', path: '/pipeline', icon: Kanban },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'AI Insights', path: '/ai-insights', icon: Brain },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Filter pages
  const filteredPages = pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  // Search leads
  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/leads?search=${query}&limit=5`);
        setSearchResults(res.data.data || []);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const allResults = [
    ...filteredPages.map(p => ({ type: 'page', ...p })),
    ...searchResults.map(l => ({ type: 'lead', name: l.name, path: `/leads/${l._id}`, company: l.company })),
  ];

  const handleSelect = useCallback((item) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, allResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && allResults[selectedIdx]) { handleSelect(allResults[selectedIdx]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="cmd-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="cmd-panel glass"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="cmd-input-wrap">
            <Search size={18} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search leads, navigate pages..."
              className="cmd-input"
            />
            <button className="cmd-close" onClick={onClose}><X size={16} /></button>
          </div>

          <div className="cmd-results">
            {allResults.length === 0 && query && (
              <div className="cmd-empty">No results found</div>
            )}
            {filteredPages.length > 0 && (
              <>
                <div className="cmd-group-label">Pages</div>
                {filteredPages.map((p, i) => (
                  <div
                    key={p.path}
                    className={`cmd-item ${selectedIdx === i ? 'cmd-item-active' : ''}`}
                    onClick={() => handleSelect(p)}
                    onMouseEnter={() => setSelectedIdx(i)}
                  >
                    <p.icon size={16} />
                    <span>{p.name}</span>
                    <ArrowRight size={14} className="cmd-arrow" />
                  </div>
                ))}
              </>
            )}
            {searchResults.length > 0 && (
              <>
                <div className="cmd-group-label">Leads</div>
                {searchResults.map((l, i) => {
                  const idx = filteredPages.length + i;
                  return (
                    <div
                      key={l._id}
                      className={`cmd-item ${selectedIdx === idx ? 'cmd-item-active' : ''}`}
                      onClick={() => handleSelect({ path: `/leads/${l._id}` })}
                      onMouseEnter={() => setSelectedIdx(idx)}
                    >
                      <Users size={16} />
                      <div>
                        <span>{l.name}</span>
                        {l.company && <span className="cmd-sub">{l.company}</span>}
                      </div>
                      <ArrowRight size={14} className="cmd-arrow" />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
