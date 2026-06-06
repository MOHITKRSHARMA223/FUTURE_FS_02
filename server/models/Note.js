const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: [true, 'Note text is required'],
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Always sort notes newest-first by default
noteSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
