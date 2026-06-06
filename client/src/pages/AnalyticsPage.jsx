import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, AreaChart, Area,
} from 'recharts';
import {
  BarChart3, Download, TrendingUp, DollarSign, Users, Target,
} from 'lucide-react';
import Card from '../components/ui/Card';
import api from '../services/api';
import { CHART_COLORS, STATUS_COLORS } from '../utils/constants';
import './AnalyticsPage.css';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="analytics-loading">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton analytics-skeleton" />)}
      </div>
    );
  }

  const { overview, statusDistribution, sourceDistribution, sourcePerformance, priorityDistribution, funnel, monthlyLeads, followUps } = data;

  const stats = [
    { label: 'Total Leads', value: overview.totalLeads, icon: Users, color: '#6366f1' },
    { label: 'Conversion Rate', value: `${overview.conversionRate}%`, icon: Target, color: '#10b981' },
    { label: 'Total Pipeline', value: `$${(overview.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: '#f59e0b' },
    { label: 'Revenue Won', value: `$${((overview.convertedRevenue || 0) / 1000).toFixed(0)}K`, icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="analytics-page">
      <div className="analytics-header">
        <h2 className="analytics-title"><BarChart3 size={22} /> Analytics</h2>
      </div>

      {/* Stats row */}
      <div className="analytics-stats">
        {stats.map((s, i) => (
          <motion.div key={i} variants={item}>
            <Card className="analytics-stat" hover>
              <div className="analytics-stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="analytics-stat-label">{s.label}</div>
                <div className="analytics-stat-value">{s.value}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Monthly Trend */}
        <motion.div variants={item}>
          <Card className="analytics-chart" variant="glow">
            <h3 className="analytics-chart-title">Monthly Leads & Revenue</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyLeads}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#leadGrad)" name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Source Performance */}
        <motion.div variants={item}>
          <Card className="analytics-chart" variant="glow">
            <h3 className="analytics-chart-title">Source Performance</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sourcePerformance} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 6, 6, 0]} name="Total" barSize={16} />
                <Bar dataKey="converted" fill="#10b981" radius={[0, 6, 6, 0]} name="Converted" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={item}>
          <Card className="analytics-chart" variant="glow">
            <h3 className="analytics-chart-title">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%" cy="50%"
                  outerRadius={90} innerRadius={55}
                  dataKey="value" nameKey="name"
                  stroke="none"
                >
                  {statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name]?.text || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div variants={item}>
          <Card className="analytics-chart" variant="glow">
            <h3 className="analytics-chart-title">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%" cy="50%"
                  outerRadius={90} innerRadius={55}
                  dataKey="value" nameKey="name"
                  stroke="none"
                >
                  {(priorityDistribution || []).map((entry, i) => {
                    const colors = { Low: '#22c55e', Medium: '#eab308', High: '#f97316', Urgent: '#ef4444' };
                    return <Cell key={i} fill={colors[entry.name] || CHART_COLORS[i]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Funnel */}
        <motion.div variants={item} className="analytics-full-width">
          <Card className="analytics-chart" variant="glow">
            <h3 className="analytics-chart-title">Conversion Funnel</h3>
            <div className="analytics-funnel">
              {funnel?.map((s, i) => {
                const maxCount = Math.max(...(funnel?.map(f => f.count) || [1]));
                const width = maxCount > 0 ? Math.max(15, (s.count / maxCount) * 100) : 15;
                const colors = ['#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444'];
                return (
                  <div key={s.name} className="analytics-funnel-row">
                    <span className="analytics-funnel-label">{s.name}</span>
                    <div className="analytics-funnel-bar-wrap">
                      <motion.div
                        className="analytics-funnel-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ background: colors[i] }}
                      />
                    </div>
                    <div className="analytics-funnel-meta">
                      <span className="analytics-funnel-count">{s.count}</span>
                      {s.value > 0 && <span className="analytics-funnel-value">${(s.value / 1000).toFixed(0)}K</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
