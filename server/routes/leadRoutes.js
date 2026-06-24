const express = require('express');
const router = express.Router();
const { getLeads, getLead, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { addNote, getNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);    

// Lead CRUD
router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(deleteLead);

// Notes sub-routes
router.route('/:id/notes')
  .get(getNotes)
  .post(addNote);

module.exports = router;