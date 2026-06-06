const Lead = require('../models/Lead');
const Note = require('../models/Note');
const Activity = require('../models/Activity');

/**
 * @desc    Get all leads with search, filter, sort, pagination
 * @route   GET /api/leads
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search = '',
      status = '', source = '', priority = '',
      pipelineStage = '', assignedTo = '',
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;
    if (pipelineStage) query.pipelineStage = pipelineStage;
    if (assignedTo) query.assignedTo = assignedTo;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email avatar')
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lead by ID (with notes + activities)
 */
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('statusHistory.changedBy', 'name email');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const notes = await Note.find({ leadId: lead._id })
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    const activities = await Activity.find({ leadId: lead._id })
      .populate('userId', 'name email avatar')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      data: { ...lead.toObject(), notes, activities },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lead
 */
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, source, status, priority, pipelineStage, value, tags, followUpDate, nextFollowUp } = req.body;

    const lead = await Lead.create({
      name, email, phone, company, source,
      status: status || 'New',
      priority: priority || 'Medium',
      pipelineStage: pipelineStage || 'New',
      value: value || 0,
      tags: tags || [],
      followUpDate, nextFollowUp,
      assignedTo: req.user._id,
      statusHistory: [{
        status: status || 'New',
        changedAt: new Date(),
        changedBy: req.user._id,
      }],
    });

    // Log activity
    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      type: 'lead_created',
      description: `Created lead "${name}"`,
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lead
 */
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { name, email, phone, company, source, status, priority, pipelineStage, value, tags, followUpDate, nextFollowUp, assignedTo } = req.body;

    // Track status changes
    if (status && status !== lead.status) {
      lead.statusHistory.push({ status, changedAt: new Date(), changedBy: req.user._id });
      await Activity.create({
        leadId: lead._id, userId: req.user._id,
        type: 'status_change',
        description: `Status changed from "${lead.status}" to "${status}"`,
        metadata: { from: lead.status, to: status },
      });
    }

    // Track pipeline changes
    if (pipelineStage && pipelineStage !== lead.pipelineStage) {
      await Activity.create({
        leadId: lead._id, userId: req.user._id,
        type: 'pipeline_move',
        description: `Moved from "${lead.pipelineStage}" to "${pipelineStage}"`,
        metadata: { from: lead.pipelineStage, to: pipelineStage },
      });
    }

    // Track priority changes
    if (priority && priority !== lead.priority) {
      await Activity.create({
        leadId: lead._id, userId: req.user._id,
        type: 'priority_change',
        description: `Priority changed from "${lead.priority}" to "${priority}"`,
        metadata: { from: lead.priority, to: priority },
      });
    }

    // Update fields
    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (company !== undefined) lead.company = company;
    if (source !== undefined) lead.source = source;
    if (status !== undefined) lead.status = status;
    if (priority !== undefined) lead.priority = priority;
    if (pipelineStage !== undefined) lead.pipelineStage = pipelineStage;
    if (value !== undefined) lead.value = value;
    if (tags !== undefined) lead.tags = tags;
    if (followUpDate !== undefined) lead.followUpDate = followUpDate;
    if (nextFollowUp !== undefined) lead.nextFollowUp = nextFollowUp;
    if (assignedTo !== undefined) lead.assignedTo = assignedTo;

    await lead.save();
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lead
 */
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    await Note.deleteMany({ leadId: lead._id });
    await Activity.deleteMany({ leadId: lead._id });
    await lead.deleteOne();
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead };
