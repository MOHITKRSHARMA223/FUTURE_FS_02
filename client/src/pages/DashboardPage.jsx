import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Users, TrendingUp, DollarSign, Clock, CalendarCheck, Target,
  ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../services/api';
import { STATUS_COLORS, ACTIVITY_TYPES } from '../utils/constants';
import './DashboardPage.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading || !data) {
    return (
      <div className="dash-loading">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton dash-skeleton-card" />)}
      </div>
    );
  }

  const { overview, followUps, monthlyLeads, recentLeads, recentActivity, funnel } = data;

  const widgets = [
    { label: 'Total Leads', value: overview.totalLeads, icon: Users, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', change: '+12%', up: true },
    { label: 'Revenue Pipeline', value: `$${(overview.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, gradient: 'linear-gradient(135deg, #10b981, #059669)', change: '+8%', up: true },
    { label: 'Conversion Rate', value: `${overview.conversionRate}%`, icon: Target, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', change: overview.conversionRate > 15 ? '+5%' : '-2%', up: overview.conversionRate > 15 },
    { label: 'Avg Deal Value', value: `$${overview.avgDealValue?.toLocaleString() || 0}`, icon: TrendingUp, gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', change: '+15%', up: true },
    { label: 'Due Today', value: followUps?.dueToday || 0, icon: CalendarCheck, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', change: `${followUps?.overdue || 0} overdue`, up: false },
    { label: 'Converted', value: overview.convertedLeads, icon: Activity, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', change: `$${((overview.convertedRevenue || 0) / 1000).toFixed(0)}K won`, up: true },
  ];

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="dashboard">
      {/* Stat Widgets */}
      <div className="dash-widgets">
        {widgets.map((w, i) => (
          <motion.div key={i} variants={item}>
            <Card hover gradient={w.gradient} className="dash-widget">
              <div className="dash-widget-top">
                <span className="dash-widget-label">{w.label}</span>
                <w.icon size={20} opacity={0.7} />
              </div>
              <div className="dash-widget-value">{w.value}</div>
              <div className="dash-widget-change">
                {w.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{w.change}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Lead Trend Chart */}
        <motion.div variants={item}>
          <Card className="dash-chart-card" variant="glow">
            <h3 className="dash-section-title">Lead Trend</h3>
            <div className="dash-chart-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyLeads}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div variants={item}>
          <Card className="dash-funnel-card" variant="glow">
            <h3 className="dash-section-title">Pipeline Funnel</h3>
            <div className="dash-funnel">
              {funnel?.map((s, i) => {
                const maxCount = Math.max(...(funnel?.map(f => f.count) || [1]));
                const width = maxCount > 0 ? Math.max(20, (s.count / maxCount) * 100) : 20;
                return (
                  <div key={s.name} className="dash-funnel-row">
                    <span className="dash-funnel-label">{s.name}</span>
                    <div className="dash-funnel-bar-wrap">
                      <motion.div
                        className="dash-funnel-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        style={{ background: ['#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444'][i] }}
                      />
                    </div>
                    <span className="dash-funnel-count">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity + Recent Leads */}
      <div className="dash-grid">
        <motion.div variants={item}>
          <Card className="dash-activity-card">
            <div className="dash-section-header">
              <h3 className="dash-section-title">
                <Activity size={18} /> Recent Activity
              </h3>
            </div>
            <div className="dash-activity-list">
              {(recentActivity || []).slice(0, 8).map((a, i) => (
                <div key={a._id || i} className="dash-activity-item">
                  <div className="dash-activity-dot" style={{ background: ACTIVITY_TYPES[a.type]?.color || '#6366f1' }} />
                  <div className="dash-activity-content">
                    <span className="dash-activity-desc">{a.description}</span>
                    <span className="dash-activity-meta">
                      {a.leadId?.name && <strong>{a.leadId.name}</strong>}
                      {' · '}{timeAgo(a.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <p className="dash-empty">No recent activity</p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="dash-leads-card">
            <div className="dash-section-header">
              <h3 className="dash-section-title">Recent Leads</h3>
              <button className="dash-view-all" onClick={() => navigate('/leads')}>View All →</button>
            </div>
            <div className="dash-leads-list">
              {(recentLeads || []).slice(0, 6).map((l) => (
                <div key={l._id} className="dash-lead-item" onClick={() => navigate(`/leads/${l._id}`)}>
                  <div className="dash-lead-avatar" style={{ background: `hsl(${l.name.charCodeAt(0) * 7}, 60%, 55%)` }}>
                    {l.name.charAt(0)}
                  </div>
                  <div className="dash-lead-info">
                    <span className="dash-lead-name">{l.name}</span>
                    <span className="dash-lead-company">{l.company}</span>
                  </div>
                  <div className="dash-lead-right">
                    <span className="dash-lead-status" style={{
                      color: STATUS_COLORS[l.status]?.text,
                      background: STATUS_COLORS[l.status]?.bg,
                    }}>
                      {l.status}
                    </span>
                    {l.value > 0 && <span className="dash-lead-value">${l.value.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
