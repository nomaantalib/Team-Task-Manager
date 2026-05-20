const express = require('express');
const { createProject, getProjects, addMember, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .put(protect, updateProject);

router.post('/:id/members', protect, addMember);

module.exports = router;
