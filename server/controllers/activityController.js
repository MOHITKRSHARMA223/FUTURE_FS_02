const Activity = require('../models/Activity');

/**
 * @desc    Get global activity feed
 * @route   GET /api/activities
 */
const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Activity.countDocuments();
    const activities = await Activity.find()
      .populate('leadId', 'name email company')
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: activities,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activities for a specific lead
 * @route   GET /api/leads/:id/activities
 */
const getLeadActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({ leadId: req.params.id })
      .populate('userId', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities, getLeadActivities };
