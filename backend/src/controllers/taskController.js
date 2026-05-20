const Task = require('../models/Task');
const Project = require('../models/Project');
const geminiService = require('../services/geminiService');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority, aiMode } = req.body;

    // Check project exists and user is a member
    const projectRecord = await Project.findById(project);
    if (!projectRecord) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!projectRecord.members.some(id => id.toString() === req.user.id) && projectRecord.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to add tasks to this project' });
    }

    let cleanDueDate = null;
    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (!isNaN(parsedDate.getTime())) {
        cleanDueDate = parsedDate;
      }
    }

    let taskData = {
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      dueDate: cleanDueDate,
      priority: priority || 'medium',
      aiMode: aiMode || false,
    };

    // If AI Mode is enabled, enrich the task data via Gemini AI
    if (aiMode) {
      if (req.body.generatedSubtasks && Array.isArray(req.body.generatedSubtasks) && req.body.generatedSubtasks.length > 0) {
        taskData.priority = req.body.priority || priority || 'medium';
        taskData.estimatedHours = Number(req.body.estimatedHours) || 8;
        taskData.riskLevel = req.body.riskLevel || 'Low';
        taskData.feasibilityScore = Number(req.body.feasibilityScore) || 90;
        taskData.aiRecommendation = req.body.aiRecommendation || 'Task scheduled successfully.';
        taskData.generatedSubtasks = req.body.generatedSubtasks;
      } else {
        // Fetch existing tasks in the project to feed into workload analysis
        const existingProjectTasks = await Task.find({ project, status: { $ne: 'completed' } });
        
        try {
          console.log(`Enriching task "${title}" with Gemini AI Smart Mode...`);
          const aiAnalysis = await geminiService.analyzeAndScheduleTask(taskData, existingProjectTasks);
          
          taskData.priority = aiAnalysis.priority;
          taskData.estimatedHours = aiAnalysis.estimatedHours;
          taskData.riskLevel = aiAnalysis.riskLevel;
          taskData.feasibilityScore = aiAnalysis.feasibilityScore;
          taskData.aiRecommendation = aiAnalysis.aiRecommendation;
          taskData.generatedSubtasks = aiAnalysis.suggestedSubtasks;
        } catch (aiError) {
          console.error('Gemini enrichment failed. Creating with defaults. Error:', aiError.message);
          // Fail gracefully
          taskData.aiRecommendation = 'AI analysis was temporarily unavailable. Task created with manual inputs.';
        }
      }
    }

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email role');

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error creating task' });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check project members permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.members.some(id => id.toString() === req.user.id) && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view tasks in this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email role')
      .sort('dueDate');

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error('Get Tasks Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error fetching tasks' });
  }
};

// @desc    Update a task (supports details edit, subtask complete toggles, status drag-drop)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify user belongs to the project
    const project = await Project.findById(task.project);
    if (!project.members.some(id => id.toString() === req.user.id) && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify tasks in this project' });
    }

    const {
      title,
      description,
      assignedTo,
      status,
      dueDate,
      priority,
      aiMode,
      generatedSubtasks,
      estimatedHours,
      riskLevel,
      feasibilityScore,
      aiRecommendation,
      project: targetProjectId
    } = req.body;

    // If AI Mode was toggled on and wasn't active before, let's run AI scheduling!
    const runAiEnrichment = aiMode === true && task.aiMode === false;

    let cleanUpdateDueDate = task.dueDate;
    if (dueDate !== undefined) {
      if (dueDate === '' || dueDate === null) {
        cleanUpdateDueDate = null;
      } else {
        const parsedDate = new Date(dueDate);
        if (!isNaN(parsedDate.getTime())) {
          cleanUpdateDueDate = parsedDate;
        } else {
          cleanUpdateDueDate = null;
        }
      }
    }

    let updateFields = {
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      assignedTo: assignedTo !== undefined ? (assignedTo === '' ? null : assignedTo) : task.assignedTo,
      status: status !== undefined ? status : task.status,
      dueDate: cleanUpdateDueDate,
      priority: priority !== undefined ? priority : task.priority,
      aiMode: aiMode !== undefined ? aiMode : task.aiMode,
      generatedSubtasks: generatedSubtasks !== undefined ? generatedSubtasks : task.generatedSubtasks,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : task.estimatedHours,
      riskLevel: riskLevel !== undefined ? riskLevel : task.riskLevel,
      feasibilityScore: feasibilityScore !== undefined ? feasibilityScore : task.feasibilityScore,
      aiRecommendation: aiRecommendation !== undefined ? aiRecommendation : task.aiRecommendation,
    };

    // Safely support moving the task to another team project workspace if permitted
    if (targetProjectId !== undefined && targetProjectId !== '' && targetProjectId.toString() !== task.project.toString()) {
      const targetProject = await Project.findById(targetProjectId);
      if (!targetProject) {
        return res.status(404).json({ success: false, message: 'Target project not found' });
      }
      if (!targetProject.members.some(id => id.toString() === req.user.id) && targetProject.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to move tasks to this project' });
      }
      updateFields.project = targetProjectId;
    }


    if (runAiEnrichment) {
      const existingProjectTasks = await Task.find({ project: task.project, _id: { $ne: task._id }, status: { $ne: 'completed' } });
      try {
        console.log(`Enriching existing task "${updateFields.title}" due to AI Mode toggle activation...`);
        const aiAnalysis = await geminiService.analyzeAndScheduleTask(updateFields, existingProjectTasks);
        
        updateFields.priority = aiAnalysis.priority;
        updateFields.estimatedHours = aiAnalysis.estimatedHours;
        updateFields.riskLevel = aiAnalysis.riskLevel;
        updateFields.feasibilityScore = aiAnalysis.feasibilityScore;
        updateFields.aiRecommendation = aiAnalysis.aiRecommendation;
        
        // If subtasks are empty or newly generated, append them
        if (!updateFields.generatedSubtasks || updateFields.generatedSubtasks.length === 0) {
          updateFields.generatedSubtasks = aiAnalysis.suggestedSubtasks;
        }
      } catch (aiError) {
        console.error('AI toggle enrichment failed:', aiError.message);
        updateFields.aiRecommendation = 'AI Smart analysis encountered a temporary limitation.';
      }
    }

    // Save updates
    task = await Task.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email role');

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Update Task Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check project permission
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project owners or Admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task removed successfully',
    });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error deleting task' });
  }
};
