const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  company: {
    type: String,
    trim: true,
    default: '',
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'LinkedIn', 'Google Ads', 'Cold Call', 'Other'],
    default: 'Website',
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Converted', 'Closed'],
    default: 'New',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  pipelineStage: {
    type: String,
    enum: ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'],
    default: 'New',
  },
  value: {
    type: Number,
    default: 0,
    min: 0,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  followUpDate: {
    type: Date,
    default: null,
  },
  nextFollowUp: {
    type: Date,
    default: null,
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  // Status change history for the timeline
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
}, {
  timestamps: true,
});

// Indexes for search and filtering
leadSchema.index({ name: 'text', email: 'text', company: 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ pipelineStage: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ nextFollowUp: 1 });

module.exports = mongoose.model('Lead', leadSchema);
