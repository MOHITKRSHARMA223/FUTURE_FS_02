const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadFile } = require('../controllers/uploadController');

router.post('/:leadId', protect, upload.single('file'), uploadFile);

module.exports = router;
