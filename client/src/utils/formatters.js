/**
 * Format a date string into a human-readable format.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date string into date + time.
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Relative time (e.g. "2 hours ago").
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Truncate a string to a max length with ellipsis.
 */
export const truncate = (str, max = 50) => {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
};

/**
 * Convert leads array to CSV string for export.
 */
export const leadsToCSV = (leads) => {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Follow-up Date', 'Created'];
  const rows = leads.map((lead) => [
    lead.name,
    lead.email,
    lead.phone || '',
    lead.company || '',
    lead.source,
    lead.status,
    lead.followUpDate ? formatDate(lead.followUpDate) : '',
    formatDate(lead.createdAt),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
};

/**
 * Trigger a CSV file download.
 */
export const downloadCSV = (csvString, filename = 'leads.csv') => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
