import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit3, Trash2, Mail, Phone, Building2,
  Globe, Calendar, Clock, MessageSquare, Send, User,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { SkeletonCard } from '../components/ui/Skeleton';
import { formatDate, formatDateTime, timeAgo } from '../utils/formatters';
import { validateLeadForm } from '../utils/validators';
import { LEAD_STATUSES, LEAD_SOURCES } from '../utils/constants';
import toast from 'react-hot-toast';
import './LeadDetailsPage.css';

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [sendingNote, setSendingNote] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      const data = res.data.data;
      setLead(data);
      setNotes(data.notes || []);
    } catch (err) {
      toast.error('Lead not found');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSendingNote(true);
    try {
      const res = await api.post(`/leads/${id}/notes`, { text: noteText });
      setNotes((prev) => [res.data.data, ...prev]);
      setNoteText('');
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setSendingNote(false);
    }
  };

  const openEditModal = () => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source,
      status: lead.status,
      followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateLeadForm(formData);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSaving(true);
    try {
      const res = await api.put(`/leads/${id}`, formData);
      setLead((prev) => ({ ...prev, ...res.data.data }));
      setEditOpen(false);
      toast.success('Lead updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (!lead) return null;

  const infoItems = [
    { icon: Mail, label: 'Email', value: lead.email },
    { icon: Phone, label: 'Phone', value: lead.phone || '—' },
    { icon: Building2, label: 'Company', value: lead.company || '—' },
    { icon: Globe, label: 'Source', value: lead.source },
    { icon: Calendar, label: 'Follow-up', value: lead.followUpDate ? formatDate(lead.followUpDate) : 'Not set' },
    { icon: Clock, label: 'Created', value: formatDateTime(lead.createdAt) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lead-details">
      {/* Breadcrumb */}
      <div className="lead-details-breadcrumb">
        <Link to="/leads" className="breadcrumb-back">
          <ArrowLeft size={18} /> Back to Leads
        </Link>
      </div>

      {/* Header */}
      <Card className="lead-details-header">
        <div className="lead-details-avatar">{lead.name.charAt(0).toUpperCase()}</div>
        <div className="lead-details-info">
          <h2 className="lead-details-name">{lead.name}</h2>
          <p className="lead-details-email">{lead.email}</p>
          <div className="lead-details-badges">
            <Badge status={lead.status} />
            <Badge variant="outline">{lead.source}</Badge>
          </div>
        </div>
        <div className="lead-details-actions">
          <Button variant="secondary" icon={Edit3} onClick={openEditModal}>Edit</Button>
          <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </Card>

      <div className="lead-details-body">
        {/* Info Panel */}
        <Card className="lead-info-card">
          <h3 className="lead-info-title"><User size={18} /> Lead Information</h3>
          <div className="lead-info-grid">
            {infoItems.map((item) => (
              <div key={item.label} className="lead-info-item">
                <item.icon size={16} className="lead-info-icon" />
                <div>
                  <span className="lead-info-label">{item.label}</span>
                  <span className="lead-info-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status Timeline */}
        {lead.statusHistory && lead.statusHistory.length > 0 && (
          <Card className="lead-timeline-card">
            <h3 className="lead-info-title"><Clock size={18} /> Status Timeline</h3>
            <div className="lead-timeline">
              {lead.statusHistory.map((entry, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  {i < lead.statusHistory.length - 1 && <div className="timeline-line" />}
                  <div className="timeline-content">
                    <Badge status={entry.status} size="sm" />
                    <span className="timeline-date">{formatDateTime(entry.changedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes Section */}
        <Card className="lead-notes-card">
          <h3 className="lead-info-title"><MessageSquare size={18} /> Notes ({notes.length})</h3>

          {/* Add Note Form */}
          <form onSubmit={handleAddNote} className="note-form">
            <textarea
              placeholder="Add a follow-up note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="note-textarea"
              rows={3}
            />
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              loading={sendingNote}
              disabled={!noteText.trim()}
            >
              Add Note
            </Button>
          </form>

          {/* Notes List */}
          <div className="notes-list">
            {notes.length === 0 ? (
              <p className="notes-empty">No notes yet. Add your first note above.</p>
            ) : (
              notes.map((note) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="note-item"
                >
                  <div className="note-header">
                    <span className="note-author">{note.createdBy?.name || 'Admin'}</span>
                    <span className="note-time">{timeAgo(note.createdAt)}</span>
                  </div>
                  <p className="note-text">{note.text}</p>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Lead">
        <form onSubmit={handleEditSubmit} className="lead-form">
          <Input label="Full Name *" name="name" value={formData.name} onChange={handleFormChange} error={formErrors.name} />
          <Input label="Email *" name="email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} />
          <div className="form-row">
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleFormChange} error={formErrors.phone} />
            <Input label="Company" name="company" value={formData.company} onChange={handleFormChange} />
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
          <div className="form-group">
            <label className="form-label">Follow-up Date</label>
            <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleFormChange} className="form-date-input" />
          </div>
          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Lead">
        <div className="delete-confirm">
          <p>Are you sure you want to delete <strong>{lead.name}</strong>? All associated notes will also be deleted.</p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default LeadDetailsPage;
