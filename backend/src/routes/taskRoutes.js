const express = require('express');
const { createTask, getTasks, updateTask, deleteTask, getAllUserTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createTask)
  .get(protect, getAllUserTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.get('/project/:projectId', protect, getTasks);

module.exports = router;
