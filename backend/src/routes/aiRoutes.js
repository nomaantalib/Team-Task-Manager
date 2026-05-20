const express = require('express');
const { parseNaturalLanguageTask, generateDescription, generateSubtasks, getInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/parse', protect, parseNaturalLanguageTask);
router.post('/generate-description', protect, generateDescription);
router.post('/generate-subtasks', protect, generateSubtasks);
router.get('/insights/:projectId', protect, getInsights);

module.exports = router;
