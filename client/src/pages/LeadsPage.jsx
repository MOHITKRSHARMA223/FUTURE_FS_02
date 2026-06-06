import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Filter, Download, ChevronLeft, ChevronRight,
  Edit3, Trash2, Eye, X, Calendar,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { formatDate, leadsToCSV, downloadCSV } from '../utils/formatters';
import { validateLeadForm } from '../utils/validators';
import { LEAD_STATUSES, LEAD_SOURCES, PRIORITY_LEVELS, PRIORITY_COLORS } from '../utils/constants';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import './LeadsPage.css';

const emptyLead = {
  name: '', email: '', phone: '', company: '',
  source: 'Website', status: 'New', priority: 'Medium', value: '',
  followUpDate: '',
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState(emptyLead);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus) params.status = filterStatus;
      if (filterSource) params.source = filterSource;

      const res = await api.get('/leads', { params });
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, filterSource, pagination.limit]);

  useEffect(() => {
    fetchLeads(1);
  }, [debouncedSearch, filterStatus, filterSource]);

  // Open add modal
  const openAddModal = () => {
    setFormData(emptyLead);
    setFormErrors({});
    setModalMode('add');
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (lead) => {
    setFormData({
      _id: lead._id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source,
      status: lead.status,
      priority: lead.priority || 'Medium',
      value: lead.value || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
    });
    setFormErrors({});
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateLeadForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.followUpDate) delete payload.followUpDate;

      if (modalMode === 'add') {
        await api.post('/leads', payload);
        toast.success('Lead created successfully!');
      } else {
        await api.put(`/leads/${formData._id}`, payload);
        toast.success('Lead updated successfully!');
      }
      setModalOpen(false);
      fetchLeads(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      toast.success('Lead deleted');
      setDeleteTarget(null);
      fetchLeads(pagination.page);
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('No leads to export');
      return;
    }
    const csv = leadsToCSV(leads);
    downloadCSV(csv, `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Leads exported!');
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterSource('');
  };

  const hasActiveFilters = search || filterStatus || filterSource;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leads-page">
      {/* Header */}
      <div className="leads-header">
        <div className="leads-header-left">
          <h2 className="leads-title">All Leads</h2>
          <span className="leads-count">{pagination.total} total</span>
        </div>
        <div className="leads-header-right">
          <Button variant="ghost" icon={Download} onClick={handleExport}>Export</Button>
          <Button variant="primary" icon={Plus} onClick={openAddModal}>Add Lead</Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="leads-toolbar">
        <div className="leads-search-row">
          <div className="leads-search-wrapper">
            <Search size={18} className="leads-search-icon" />
            <input
              type="text"
              placeholder="Search leads by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="leads-search-input"
            />
          </div>
          <button
            className={`leads-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && <span className="filter-dot" />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="leads-filters"
            >
              <div className="leads-filter-group">
                <label>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="leads-filter-group">
                <label>Source</label>
                <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  <option value="">All Sources</option>
                  {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {hasActiveFilters && (
                <button className="leads-clear-btn" onClick={clearFilters}>
                  <X size={14} /> Clear
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Leads Table */}
      {loading ? (
        <div className="leads-skeleton-grid">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No leads match your filters' : 'No leads yet'}
          description={hasActiveFilters ? 'Try adjusting your search or filters.' : 'Start by adding your first lead!'}
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Lead'}
          onAction={hasActiveFilters ? clearFilters : openAddModal}
        />
      ) : (
        <>
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Priority</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <motion.tr
                    key={lead._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <td>
                      <div className="lead-name-cell">
                        <div className="lead-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                        <Link to={`/leads/${lead._id}`} className="lead-name-link">{lead.name}</Link>
                      </div>
                    </td>
                    <td className="lead-email">{lead.email}</td>
                    <td>{lead.company || '—'}</td>
                    <td>
                      <span className="priority-badge" style={{ color: PRIORITY_COLORS[lead.priority]?.hex, background: PRIORITY_COLORS[lead.priority]?.bg }}>
                        {lead.priority === 'Urgent' && '🔴 '}{lead.priority || 'Medium'}
                      </span>
                    </td>
                    <td><Badge variant="outline">{lead.source}</Badge></td>
                    <td><Badge status={lead.status} /></td>
                    <td className="lead-value">{lead.value ? `$${lead.value.toLocaleString()}` : '—'}</td>
                    <td>
                      <div className="lead-actions">
                        <Link to={`/leads/${lead._id}`} className="lead-action-btn" title="View">
                          <Eye size={16} />
                        </Link>
                        <button className="lead-action-btn" title="Edit" onClick={() => openEditModal(lead)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="lead-action-btn danger" title="Delete" onClick={() => setDeleteTarget(lead)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="leads-pagination">
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages} ({pagination.total} leads)
              </span>
              <div className="pagination-buttons">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchLeads(pagination.page - 1)}
                  className="pagination-btn"
                >
                  <ChevronLeft size={18} /> Prev
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchLeads(pagination.page + 1)}
                  className="pagination-btn"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Lead Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Lead' : 'Edit Lead'}
      >
        <form onSubmit={handleFormSubmit} className="lead-form">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            placeholder="John Doe"
          />
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            error={formErrors.email}
            placeholder="john@example.com"
          />
          <div className="form-row">
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              error={formErrors.phone}
              placeholder="+1 (555) 123-4567"
            />
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleFormChange}
              placeholder="Acme Inc."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select name="source" value={formData.source} onChange={handleFormChange} className="form-select">
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleFormChange} className="form-select">
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleFormChange} className="form-select">
                {PRIORITY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Input
              label="Deal Value ($)"
              name="value"
              type="number"
              value={formData.value}
              onChange={handleFormChange}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label"><Calendar size={14} /> Follow-up Date</label>
            <input
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleFormChange}
              className="form-date-input"
            />
          </div>
          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {modalMode === 'add' ? 'Create Lead' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Lead"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default LeadsPage;
