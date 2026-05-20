const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Create the project
    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: members || [],
    });

    // Automatically make the owner a member if not already
    if (!project.members.some(id => id.toString() === req.user.id)) {
      project.members.push(req.user.id);
      await project.save();
    }

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json({
      success: true,
      project: populatedProject,
    });
  } catch (error) {
    console.error('Create Project Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error creating project' });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    // Find projects where user is either the owner or a member
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .sort('-createdAt');

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Get Projects Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error fetching projects' });
  }
};

// @desc    Add member to a project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access control: only project owner can add members
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add members' });
    }

    // Find user by email
    const memberToAdd = await User.findOne({ email });
    if (!memberToAdd) {
      return res.status(404).json({ success: false, message: 'User with this email not found' });
    }

    // Check if user is already a member
    if (project.members.some(id => id.toString() === memberToAdd._id.toString())) {
      return res.status(400).json({ success: false, message: 'User is already a project member' });
    }

    project.members.push(memberToAdd._id);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    res.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Add Member Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error adding member' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Access control: only project owner or Admin can update project
    if (project.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update project' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    res.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Update Project Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error updating project' });
  }
};
