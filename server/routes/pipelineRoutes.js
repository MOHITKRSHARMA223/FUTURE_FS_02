const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPipeline, moveLead } = require('../controllers/pipelineController');

router.get('/', protect, getPipeline);
router.put('/:id/move', protect, moveLead);

module.exports = router;
