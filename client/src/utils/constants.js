// Lead status options
export const LEAD_STATUSES = ['New', 'Contacted', 'In Progress', 'Converted', 'Closed'];

// Lead source options
export const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Google Ads', 'Cold Call', 'Other'];

// Pipeline stages
export const PIPELINE_STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];

// Priority levels
export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent'];

// Status color mapping
export const STATUS_COLORS = {
  'New': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', darkBg: '#1e3a5f', darkText: '#60a5fa' },
  'Contacted': { bg: '#fefce8', text: '#ca8a04', border: '#fde68a', darkBg: '#422006', darkText: '#facc15' },
  'In Progress': { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff', darkBg: '#3b0764', darkText: '#c084fc' },
  'Converted': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', darkBg: '#052e16', darkText: '#4ade80' },
  'Closed': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', darkBg: '#450a0a', darkText: '#f87171' },
};

// Priority color mapping
export const PRIORITY_COLORS = {
  'Low': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', darkBg: '#052e16', darkText: '#4ade80', hex: '#22c55e' },
  'Medium': { bg: '#fefce8', text: '#ca8a04', border: '#fde68a', darkBg: '#422006', darkText: '#facc15', hex: '#eab308' },
  'High': { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa', darkBg: '#431407', darkText: '#fb923c', hex: '#f97316' },
  'Urgent': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', darkBg: '#450a0a', darkText: '#f87171', hex: '#ef4444' },
};

// Pipeline stage colors
export const PIPELINE_COLORS = {
  'New': '#6366f1',
  'Contacted': '#f59e0b',
  'Proposal Sent': '#8b5cf6',
  'Negotiation': '#06b6d4',
  'Converted': '#10b981',
  'Lost': '#ef4444',
};

// Source color mapping
export const SOURCE_COLORS = {
  'Website': '#6366f1',
  'Referral': '#8b5cf6',
  'LinkedIn': '#0ea5e9',
  'Google Ads': '#f59e0b',
  'Cold Call': '#ef4444',
  'Other': '#64748b',
};

// Activity type icons & labels
export const ACTIVITY_TYPES = {
  lead_created: { label: 'Lead Created', color: '#6366f1' },
  status_change: { label: 'Status Changed', color: '#f59e0b' },
  pipeline_move: { label: 'Pipeline Updated', color: '#8b5cf6' },
  note_added: { label: 'Note Added', color: '#10b981' },
  call_scheduled: { label: 'Call Scheduled', color: '#06b6d4' },
  email_sent: { label: 'Email Sent', color: '#3b82f6' },
  meeting: { label: 'Meeting', color: '#ec4899' },
  follow_up: { label: 'Follow-up', color: '#f97316' },
  attachment: { label: 'File Uploaded', color: '#64748b' },
  priority_change: { label: 'Priority Changed', color: '#eab308' },
};

// Chart colors
export const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

// Pagination
export const PAGE_SIZES = [10, 25, 50];
