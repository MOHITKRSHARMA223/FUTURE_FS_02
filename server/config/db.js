const mongoose = require('mongoose');

const seedDemoData = async () => {
  const User = require('../models/User');
  const Lead = require('../models/Lead');
  const Note = require('../models/Note');
  const Activity = require('../models/Activity');
  const Notification = require('../models/Notification');

  // Seed admin user
  let admin = await User.findOne({ email: 'admin@crm.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: 'admin@crm.com', password: 'Admin@123', role: 'admin', department: 'Management' });
    console.log(`👤 Admin user seeded: admin@crm.com / Admin@123`);
  }

  // Check if leads already exist
  const count = await Lead.countDocuments();
  if (count > 0) return;

  // Demo leads
  const demoLeads = [
    { name: 'Sarah Johnson', email: 'sarah@techcorp.io', phone: '+1 555-987-6543', company: 'TechCorp', source: 'LinkedIn', status: 'Contacted', priority: 'High', pipelineStage: 'Contacted', value: 15000, tags: ['enterprise', 'tech'] },
    { name: 'Michael Chen', email: 'mchen@globalinc.com', phone: '+1 555-234-5678', company: 'Global Inc', source: 'Google Ads', status: 'Converted', priority: 'High', pipelineStage: 'Converted', value: 45000, tags: ['enterprise'] },
    { name: 'Emily Davis', email: 'emily@startup.co', phone: '+1 555-345-6789', company: 'StartupCo', source: 'Referral', status: 'In Progress', priority: 'Medium', pipelineStage: 'Proposal Sent', value: 8000, tags: ['startup', 'saas'] },
    { name: 'Robert Wilson', email: 'rwilson@enterprise.com', phone: '+1 555-456-7890', company: 'Enterprise Solutions', source: 'Cold Call', status: 'Closed', priority: 'Low', pipelineStage: 'Lost', value: 25000, tags: ['enterprise'] },
    { name: 'John Smith', email: 'john@acme.com', phone: '+1 555-123-4567', company: 'Acme Corp', source: 'Website', status: 'New', priority: 'Medium', pipelineStage: 'New', value: 12000, tags: ['smb'] },
    { name: 'Lisa Park', email: 'lisa@designhub.io', phone: '+1 555-567-8901', company: 'DesignHub', source: 'LinkedIn', status: 'In Progress', priority: 'Urgent', pipelineStage: 'Negotiation', value: 35000, tags: ['agency', 'design'] },
    { name: 'James Rodriguez', email: 'james@mediaco.com', phone: '+1 555-678-9012', company: 'MediaCo', source: 'Referral', status: 'Contacted', priority: 'High', pipelineStage: 'Contacted', value: 20000, tags: ['media'] },
    { name: 'Anna Thompson', email: 'anna@cloudnine.io', phone: '+1 555-789-0123', company: 'CloudNine', source: 'Website', status: 'New', priority: 'Medium', pipelineStage: 'New', value: 5000, tags: ['tech', 'cloud'] },
    { name: 'David Kim', email: 'david@fintech.co', phone: '+1 555-890-1234', company: 'FinTech Co', source: 'Google Ads', status: 'Converted', priority: 'High', pipelineStage: 'Converted', value: 60000, tags: ['fintech', 'enterprise'] },
    { name: 'Maria Garcia', email: 'maria@retailplus.com', phone: '+1 555-901-2345', company: 'RetailPlus', source: 'Cold Call', status: 'In Progress', priority: 'Medium', pipelineStage: 'Proposal Sent', value: 18000, tags: ['retail'] },
  ];

  const now = new Date();
  for (let i = 0; i < demoLeads.length; i++) {
    const d = demoLeads[i];
    const createdAt = new Date(now - (i * 2 + 1) * 24 * 60 * 60 * 1000); // Spread over days
    const followUp = new Date(now);
    followUp.setDate(followUp.getDate() + (i % 5) - 1); // Some past, some future

    const lead = await Lead.create({
      ...d,
      assignedTo: admin._id,
      followUpDate: followUp,
      nextFollowUp: followUp,
      statusHistory: [{ status: d.status, changedAt: createdAt, changedBy: admin._id }],
      createdAt,
      updatedAt: createdAt,
    });

    // Add activity
    await Activity.create({
      leadId: lead._id, userId: admin._id,
      type: 'lead_created',
      description: `Created lead "${d.name}"`,
      createdAt,
    });

    // Add note for some leads
    if (i < 6) {
      await Note.create({
        leadId: lead._id, createdBy: admin._id,
        text: `Initial contact with ${d.name} from ${d.company}. ${i % 2 === 0 ? 'Very interested in our platform.' : 'Needs follow-up next week.'}`,
        createdAt: new Date(createdAt.getTime() + 3600000),
      });
      await Activity.create({
        leadId: lead._id, userId: admin._id,
        type: 'note_added', description: 'Added initial notes',
        createdAt: new Date(createdAt.getTime() + 3600000),
      });
    }
  }

  // Add demo notifications
  const leads = await Lead.find().limit(5);
  const notifs = [
    { type: 'follow_up_due', title: 'Follow-up Due', message: `Follow up with ${leads[0]?.name} is due today`, link: `/leads/${leads[0]?._id}` },
    { type: 'lead_converted', title: 'Lead Converted! 🎉', message: `${leads[1]?.name} has been converted`, link: `/leads/${leads[1]?._id}` },
    { type: 'system', title: 'Welcome to LeadFlow CRM', message: 'Your AI-powered CRM is ready to use', link: '/' },
  ];
  for (const n of notifs) {
    await Notification.create({ ...n, userId: admin._id });
  }

  console.log(`📊 Seeded ${demoLeads.length} demo leads with notes, activities & notifications`);
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedDemoData();
  } catch (error) {
    console.log(`⚠️  Local MongoDB unavailable, starting in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`📌 Note: Data will be lost when the server stops`);
      await seedDemoData();
    } catch (memError) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.error(`❌ In-Memory fallback also failed: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
