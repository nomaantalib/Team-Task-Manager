const Project = require('../models/Project');
const Task = require('../models/Task');
const geminiService = require('../services/geminiService');

// @desc    Parse natural language into structured task data
// @route   POST /api/ai/parse
// @access  Private
exports.parseNaturalLanguageTask = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide natural language text to parse.' });
    }

    console.log(`Parsing natural language task text: "${text}"`);
    const parsedData = await geminiService.parseNaturalLanguageTask(text);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error('NLP Parse Controller Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process natural language input' });
  }
};

// @desc    Generate rich technical description from a short title
// @route   POST /api/ai/generate-description
// @access  Private
exports.generateDescription = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a task title.' });
    }

    console.log(`Generating AI description for title: "${title}"`);
    const description = await geminiService.generateDescription(title);

    res.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error('AI Description Controller Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate task description' });
  }
};

// @desc    Generate a sequential subtask checklist
// @route   POST /api/ai/generate-subtasks
// @access  Private
exports.generateSubtasks = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a task title.' });
    }

    console.log(`Generating AI subtasks for task: "${title}"`);
    const subtasks = await geminiService.generateSubtasks(title, description);

    res.json({
      success: true,
      subtasks,
    });
  } catch (error) {
    console.error('AI Subtask Controller Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate subtasks' });
  }
};

// @desc    Retrieve project-wide productivity insights and active workload balancing charts
// @route   GET /api/ai/insights/:projectId
// @access  Private
exports.getInsights = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project and members
    const project = await Project.findById(projectId).populate('members', 'name email role');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.members.some(m => m._id.toString() === req.user.id) && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view insights for this project' });
    }

    // Fetch all active tasks
    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email role');

    console.log(`Analyzing project "${project.name}" tasks for team productivity insights...`);
    const insights = await geminiService.generateProductivityInsights(tasks, project.members);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('AI Insights Controller Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to compile AI insights dashboard' });
  }
};
