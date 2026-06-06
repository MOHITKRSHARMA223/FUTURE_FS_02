const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.xlsx', '.csv', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * @desc    Upload file and attach to a lead
 * @route   POST /api/upload/:leadId
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const lead = await Lead.findById(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
    };

    lead.attachments.push(attachment);
    await lead.save();

    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      type: 'attachment',
      description: `Uploaded "${req.file.originalname}"`,
    });

    res.status(200).json({ success: true, data: attachment });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadFile };
