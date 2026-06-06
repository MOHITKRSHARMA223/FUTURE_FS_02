const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeadScore, generateEmail, summarizeNotes } = require('../controllers/aiController');

router.get('/lead-score/:id', protect, getLeadScore);
router.post('/generate-email', protect, generateEmail);
router.post('/summarize-notes', protect, summarizeNotes);

module.exports = router;
