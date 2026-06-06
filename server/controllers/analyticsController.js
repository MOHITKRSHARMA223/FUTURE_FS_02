const Lead = require('../models/Lead');
const Note = require('../models/Note');
const Activity = require('../models/Activity');

const getAnalytics = async (req, res, next) => {
  try {
    // Status counts
    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    const totalLeads = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const newLeads = statusMap['New'] || 0;
    const contactedLeads = statusMap['Contacted'] || 0;
    const inProgressLeads = statusMap['In Progress'] || 0;
    const convertedLeads = statusMap['Converted'] || 0;
    const closedLeads = statusMap['Closed'] || 0;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Revenue metrics
    const revenueData = await Lead.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$value' }, avgValue: { $avg: '$value' } } },
    ]);
    const totalRevenue = revenueData[0]?.totalValue || 0;
    const avgDealValue = Math.round(revenueData[0]?.avgValue || 0);

    // Converted revenue
    const convertedRevenue = await Lead.aggregate([
      { $match: { pipelineStage: 'Converted' } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);

    // Pipeline funnel
    const pipelineStages = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost'];
    const funnelData = await Lead.aggregate([
      { $group: { _id: '$pipelineStage', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]);
    const funnel = pipelineStages.map((stage) => {
      const found = funnelData.find(f => f._id === stage);
      return { name: stage, count: found?.count || 0, value: found?.value || 0 };
    });

    // Priority distribution
    const priorityCounts = await Lead.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Source distribution
    const sourceCounts = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    // Source performance (conversion rate by source)
    const sourcePerformance = await Lead.aggregate([
      { $group: { _id: '$source', total: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ['$pipelineStage', 'Converted'] }, 1, 0] } }, value: { $sum: '$value' } } },
    ]);

    // Monthly leads (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const monthlyLeads = await Lead.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 }, value: { $sum: '$value' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyLeads.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
      value: m.value,
    }));

    // Follow-up stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

    const dueToday = await Lead.countDocuments({ nextFollowUp: { $gte: todayStart, $lt: todayEnd } });
    const overdue = await Lead.countDocuments({ nextFollowUp: { $lt: todayStart, $ne: null } });
    const upcoming = await Lead.countDocuments({ nextFollowUp: { $gte: todayEnd } });

    // Recent leads
    const recentLeads = await Lead.find().sort('-createdAt').limit(10)
      .select('name email company status priority pipelineStage value source createdAt');

    // Recent activity
    const recentActivity = await Activity.find().sort('-createdAt').limit(15)
      .populate('leadId', 'name').populate('userId', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalLeads, newLeads, contactedLeads, inProgressLeads,
          convertedLeads, closedLeads,
          conversionRate: parseFloat(conversionRate),
          totalRevenue, avgDealValue,
          convertedRevenue: convertedRevenue[0]?.total || 0,
        },
        followUps: { dueToday, overdue, upcoming },
        statusDistribution: statusCounts.map(s => ({ name: s._id, value: s.count })),
        sourceDistribution: sourceCounts.map(s => ({ name: s._id, value: s.count })),
        sourcePerformance: sourcePerformance.map(s => ({
          name: s._id,
          total: s.total,
          converted: s.converted,
          rate: s.total > 0 ? Math.round((s.converted / s.total) * 100) : 0,
          value: s.value,
        })),
        priorityDistribution: priorityCounts.map(p => ({ name: p._id, value: p.count })),
        funnel,
        monthlyLeads: formattedMonthly,
        recentLeads,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
