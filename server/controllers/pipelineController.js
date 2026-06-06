const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

/**
 * @desc    Get pipeline data (leads grouped by stage)
 * @route   GET /api/pipeline
 */
const getPipeline = async (req, res, next) => {
  try {
    const stages = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];
    const pipeline = {};

    for (const stage of stages) {
      const leads = await Lead.find({ pipelineStage: stage })
        .populate('assignedTo', 'name avatar')
        .sort('-updatedAt')
        .select('name email company value priority pipelineStage tags createdAt updatedAt');
      
      const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
      pipeline[stage] = { leads, count: leads.length, totalValue };
    }

    res.status(200).json({ success: true, data: pipeline });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Move lead between pipeline stages
 * @route   PUT /api/pipeline/:id/move
 */
const moveLead = async (req, res, next) => {
  try {
    const { stage } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const oldStage = lead.pipelineStage;
    lead.pipelineStage = stage;

    // Sync status with pipeline stage
    if (stage === 'Converted') lead.status = 'Converted';
    else if (stage === 'Lost') lead.status = 'Closed';
    else if (stage === 'Contacted') lead.status = 'Contacted';
    else if (stage === 'Proposal Sent' || stage === 'Negotiation') lead.status = 'In Progress';

    lead.statusHistory.push({
      status: lead.status,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await lead.save();

    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      type: 'pipeline_move',
      description: `Moved from "${oldStage}" to "${stage}"`,
      metadata: { from: oldStage, to: stage },
    });

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPipeline, moveLead };
