const Lead = require('../models/Lead');
const Note = require('../models/Note');
const Activity = require('../models/Activity');

/**
 * @desc    Generate AI lead score (simulated intelligent scoring)
 * @route   GET /api/ai/lead-score/:id
 */
const getLeadScore = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const notes = await Note.countDocuments({ leadId: lead._id });
    const activities = await Activity.countDocuments({ leadId: lead._id });

    // Scoring algorithm
    let score = 30; // base
    if (lead.email) score += 5;
    if (lead.phone) score += 5;
    if (lead.company) score += 5;
    if (lead.value > 0) score += Math.min(15, Math.floor(lead.value / 1000));
    if (notes > 0) score += Math.min(10, notes * 3);
    if (activities > 2) score += Math.min(10, activities * 2);
    if (lead.priority === 'Urgent') score += 8;
    else if (lead.priority === 'High') score += 5;
    if (['Proposal Sent', 'Negotiation'].includes(lead.pipelineStage)) score += 10;
    if (lead.pipelineStage === 'Converted') score += 15;
    if (lead.nextFollowUp && new Date(lead.nextFollowUp) > new Date()) score += 5;
    if (lead.tags?.length > 0) score += 3;
    score = Math.min(100, Math.max(0, score));

    // Conversion probability
    const convProb = Math.min(95, Math.max(5, score * 0.9 + (Math.random() * 10 - 5)));

    // Suggested next action
    const actions = [];
    if (!lead.phone) actions.push({ action: 'Add phone number', impact: 'Medium', reason: 'Missing contact info reduces reachability' });
    if (notes === 0) actions.push({ action: 'Add first note', impact: 'High', reason: 'Document initial conversation' });
    if (!lead.nextFollowUp) actions.push({ action: 'Schedule follow-up', impact: 'High', reason: 'No follow-up date set' });
    if (lead.pipelineStage === 'Contacted') actions.push({ action: 'Send proposal', impact: 'High', reason: 'Move lead to next pipeline stage' });
    if (lead.pipelineStage === 'Proposal Sent') actions.push({ action: 'Schedule negotiation call', impact: 'High', reason: 'Close the deal faster' });
    if (lead.pipelineStage === 'New') actions.push({ action: 'Make initial contact', impact: 'Critical', reason: 'Lead has not been contacted yet' });
    if (lead.value === 0) actions.push({ action: 'Estimate deal value', impact: 'Medium', reason: 'Helps prioritize pipeline' });

    res.status(200).json({
      success: true,
      data: {
        score,
        conversionProbability: Math.round(convProb),
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
        suggestedActions: actions.slice(0, 4),
        insights: {
          engagement: activities > 3 ? 'High' : activities > 1 ? 'Medium' : 'Low',
          dataCompleteness: [lead.email, lead.phone, lead.company, lead.value > 0].filter(Boolean).length * 25,
          pipelineVelocity: lead.pipelineStage === 'New' ? 'Stalled' : 'Active',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate AI email
 * @route   POST /api/ai/generate-email
 */
const generateEmail = async (req, res, next) => {
  try {
    const { leadId, template, customInstructions } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const firstName = lead.name.split(' ')[0];
    const company = lead.company || 'your company';

    const templates = {
      follow_up: {
        subject: `Following up on our conversation - ${company}`,
        body: `Hi ${firstName},\n\nI hope this message finds you well. I wanted to follow up on our recent conversation regarding how we can help ${company} achieve its goals.\n\nI'd love to schedule a quick call to discuss the next steps. Would you have 15 minutes available this week?\n\nLooking forward to hearing from you.\n\nBest regards`,
      },
      cold_email: {
        subject: `Quick question for ${company}`,
        body: `Hi ${firstName},\n\nI came across ${company} and was impressed by what you're building. I believe we could help you streamline your operations and drive growth.\n\nWould you be open to a brief 10-minute call to explore if there's a fit?\n\nNo pressure at all — just thought it might be worth a conversation.\n\nCheers`,
      },
      proposal: {
        subject: `Proposal for ${company} - Let's Move Forward`,
        body: `Hi ${firstName},\n\nThank you for taking the time to discuss your needs. Based on our conversation, I've put together a tailored proposal for ${company}.\n\nKey highlights:\n• Customized solution designed for your specific requirements\n• Competitive pricing with flexible payment options\n• Dedicated support and onboarding\n\nI'd love to walk you through the details. When would be a good time for a follow-up call?\n\nBest regards`,
      },
      meeting_reminder: {
        subject: `Reminder: Our Meeting Tomorrow`,
        body: `Hi ${firstName},\n\nJust a friendly reminder about our meeting scheduled for tomorrow. I'm looking forward to discussing how we can support ${company}.\n\nPlease let me know if you need to reschedule.\n\nSee you soon!`,
      },
    };

    const emailData = templates[template] || templates.follow_up;

    res.status(200).json({
      success: true,
      data: {
        subject: emailData.subject,
        body: emailData.body,
        template,
        leadName: lead.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Summarize notes for a lead
 * @route   POST /api/ai/summarize-notes
 */
const summarizeNotes = async (req, res, next) => {
  try {
    const { leadId } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const notes = await Note.find({ leadId }).sort('-createdAt');

    if (notes.length === 0) {
      return res.status(200).json({
        success: true,
        data: { summary: 'No notes available to summarize.', keyPoints: [], noteCount: 0 },
      });
    }

    // Extract key points from notes
    const allText = notes.map(n => n.text).join(' ');
    const words = allText.split(/\s+/);
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 10);

    const keyPoints = sentences.slice(0, 5).map(s => s.trim());
    const summary = notes.length === 1
      ? `1 note recorded for ${lead.name}. ${keyPoints[0] || ''}`
      : `${notes.length} notes recorded for ${lead.name} over ${Math.ceil((new Date() - new Date(notes[notes.length - 1].createdAt)) / (1000 * 60 * 60 * 24))} days. Key topics discussed include recent interactions and follow-up items.`;

    res.status(200).json({
      success: true,
      data: {
        summary,
        keyPoints,
        noteCount: notes.length,
        wordCount: words.length,
        timespan: notes.length > 1
          ? `${new Date(notes[notes.length - 1].createdAt).toLocaleDateString()} — ${new Date(notes[0].createdAt).toLocaleDateString()}`
          : new Date(notes[0].createdAt).toLocaleDateString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeadScore, generateEmail, summarizeNotes };
