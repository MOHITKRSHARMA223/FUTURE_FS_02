const Note = require('../models/Note');
const Lead = require('../models/Lead');

/**
 * @desc    Add a note to a lead
 * @route   POST /api/leads/:id/notes
 * @access  Private
 */
const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required',
      });
    }

    // Verify lead exists
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    const note = await Note.create({
      leadId: req.params.id,
      text: text.trim(),
      createdBy: req.user._id,
    });

    // Populate the createdBy field before returning
    await note.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all notes for a lead
 * @route   GET /api/leads/:id/notes
 * @access  Private
 */
const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ leadId: req.params.id })
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addNote, getNotes };
