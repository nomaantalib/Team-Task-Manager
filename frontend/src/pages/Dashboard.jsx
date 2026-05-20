import {
  AlertTriangle,
  Bot,
  Calendar,
  Layout,
  Loader,
  LogOut,
  Plus,
  PlusCircle,
  Sparkles,
  Trash2,
  UserPlus,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, authenticatedFetch } = useAuth();
  
  // App States
  const [aiMode, setAiMode] = useState(false);
  const [activeTab, setActiveTab] = useState('board'); // board, projects, insights
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // Modals / Inputs
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectNameValue, setEditingProjectNameValue] = useState('');
  
  // Traditional Task Form States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [formAiMode, setFormAiMode] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  // NLP Task States
  const [nlpText, setNlpText] = useState('');
  const [nlpParsing, setNlpParsing] = useState(false);
  const [parsedTaskData, setParsedTaskData] = useState(null);
  const [showNlpPreview, setShowNlpPreview] = useState(false);

  // Load baseline projects and users list
  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  // When selected project changes, load tasks and insights
  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject._id);
      if (aiMode) {
        loadInsights(selectedProject._id);
      }
    } else {
      setTasks([]);
      setInsights(null);
    }
  }, [selectedProject, aiMode]);

  const loadProjects = async () => {
    const data = await authenticatedFetch('/projects');
    if (data.success) {
      setProjects(data.projects);
      if (data.projects.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0]);
      }
    }
  };

  const handleStartEditProjectName = () => {
    if (!selectedProject) return;
    setEditingProjectNameValue(selectedProject.name);
    setIsEditingProjectName(true);
  };

  const handleSaveProjectName = async (e) => {
    e.preventDefault();
    if (!editingProjectNameValue.trim() || !selectedProject) return;

    const data = await authenticatedFetch(`/projects/${selectedProject._id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: editingProjectNameValue }),
    });

    if (data.success) {
      const updatedProj = data.project;
      setSelectedProject(updatedProj);
      setProjects(projects.map(p => p._id === updatedProj._id ? updatedProj : p));
      setIsEditingProjectName(false);
    } else {
      alert(data.message || 'Failed to update workspace name.');
    }
  };

  const loadUsers = async () => {
    const data = await authenticatedFetch('/auth/users');
    if (data.success) {
      setUsers(data.users);
    }
  };

  const loadTasks = async (projectId) => {
    const data = await authenticatedFetch(`/tasks/project/${projectId}`);
    if (data.success) {
      setTasks(data.tasks);
    }
  };

  const loadInsights = async (projectId) => {
    setInsightsLoading(true);
    const data = await authenticatedFetch(`/ai/insights/${projectId}`);
    if (data.success) {
      setInsights(data.data);
    }
    setInsightsLoading(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const data = await authenticatedFetch('/projects', {
      method: 'POST',
      body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
    });

    if (data.success) {
      setProjects([data.project, ...projects]);
      setSelectedProject(data.project);
      setNewProjectName('');
      setNewProjectDesc('');
      setActiveTab('board');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedProject) return;

    const data = await authenticatedFetch(`/projects/${selectedProject._id}/members`, {
      method: 'POST',
      body: JSON.stringify({ email: inviteEmail }),
    });

    if (data.success) {
      alert('Team member added successfully!');
      // Update selected project structure
      setSelectedProject(data.project);
      setProjects(projects.map(p => p._id === data.project._id ? data.project : p));
      setInviteEmail('');
    } else {
      alert(data.message || 'Failed to add member.');
    }
  };

  // Standard Task Creation (handles manual + AI-scheduled modes)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProject) return;
    setCreatingTask(true);

    const data = await authenticatedFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: taskTitle,
        description: taskDesc,
        project: selectedProject._id,
        assignedTo: taskAssignee || undefined,
        dueDate: taskDueDate || undefined,
        priority: taskPriority,
        aiMode: formAiMode,
      }),
    });

    if (data.success) {
      setTasks([...tasks, data.task]);
      setShowTaskModal(false);
      
      // Reset form fields
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setTaskDueDate('');
      setTaskPriority('medium');
      setFormAiMode(false);
    } else {
      alert(data.message || 'Failed to create task.');
    }
    setCreatingTask(false);
  };

  // Handle NLP Task Parsing
  const handleNlpParse = async (e) => {
    e.preventDefault();
    if (!nlpText.trim()) return;
    setNlpParsing(true);

    const data = await authenticatedFetch('/ai/parse', {
      method: 'POST',
      body: JSON.stringify({ text: nlpText }),
    });

    if (data.success) {
      setParsedTaskData(data.data);
      setShowNlpPreview(true);
    } else {
      alert('AI parsing failed. Please format your prompt.');
    }
    setNlpParsing(false);
  };

  // Accept and save NLP Parsed Task
  const handleSaveNlpTask = async () => {
    if (!parsedTaskData || !selectedProject) return;
    setCreatingTask(true);

    // Save parsed task directly to DB
    const data = await authenticatedFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: parsedTaskData.title,
        description: parsedTaskData.description,
        project: selectedProject._id,
        dueDate: parsedTaskData.dueDate,
        priority: parsedTaskData.priority,
        aiMode: true, // Force AI Mode enabled
        estimatedHours: parsedTaskData.estimatedHours,
        riskLevel: parsedTaskData.riskLevel,
        feasibilityScore: parsedTaskData.feasibilityScore,
        aiRecommendation: parsedTaskData.aiRecommendation,
        generatedSubtasks: parsedTaskData.generatedSubtasks,
      }),
    });

    if (data.success) {
      setTasks([...tasks, data.task]);
      setShowNlpPreview(false);
      setParsedTaskData(null);
      setNlpText('');
    } else {
      alert('Failed to save parsed task.');
    }
    setCreatingTask(false);
  };

  // Drag-and-drop simulated column shifts
  const handleStatusChange = async (taskId, newStatus) => {
    const data = await authenticatedFetch(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });

    if (data.success) {
      setTasks(tasks.map(t => t._id === taskId ? data.task : t));
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    const data = await authenticatedFetch(`/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (data.success) {
      setTasks(tasks.filter(t => t._id !== taskId));
    }
  };

  // Check off a specific Subtask checklist item
  const handleToggleSubtask = async (task, subtaskId) => {
    const updatedSubtasks = task.generatedSubtasks.map(sub => 
      sub._id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    const data = await authenticatedFetch(`/tasks/${task._id}`, {
      method: 'PUT',
      body: JSON.stringify({ generatedSubtasks: updatedSubtasks }),
    });

    if (data.success) {
      setTasks(tasks.map(t => t._id === task._id ? data.task : t));
    }
  };

  // Toggle AI Mode on an existing Task
  const handleToggleTaskAi = async (task) => {
    const data = await authenticatedFetch(`/tasks/${task._id}`, {
      method: 'PUT',
      body: JSON.stringify({ aiMode: !task.aiMode }),
    });

    if (data.success) {
      setTasks(tasks.map(t => t._id === task._id ? data.task : t));
      alert(`AI Mode toggled ${!task.aiMode ? 'ON' : 'OFF'} for this task.`);
    }
  };

  // Compile Recharts workload chart data
  const getWorkloadChartData = () => {
    if (!selectedProject || tasks.length === 0) return [];
    
    // Group estimated hours by user
    const userHours = {};
    
    // Initialize members
    selectedProject.members.forEach(m => {
      userHours[m.name] = 0;
    });

    tasks.forEach(t => {
      if (t.status !== 'completed' && t.assignedTo) {
        const assignee = selectedProject.members.find(m => m._id === (t.assignedTo._id || t.assignedTo));
        if (assignee) {
          userHours[assignee.name] += t.estimatedHours || 4; // Default to 4 hours if not set
        }
      }
    });

    return Object.keys(userHours).map(name => ({
      name: name.split(' ')[0], // First name only for readability
      Hours: userHours[name]
    }));
  };

  const workloadData = getWorkloadChartData();

  // Helper to format due dates
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter tasks into columns
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>Task Manager</span>
        </div>
        <ul className="sidebar-menu">
          <li 
            onClick={() => setActiveTab('board')}
            className={`sidebar-item ${activeTab === 'board' ? 'active' : ''} ${aiMode ? 'ai-active' : ''}`}
          >
            <Layout size={18} /> {selectedProject ? `${selectedProject.name} Board` : 'Team Board'}
          </li>
          {user.role === 'admin' && (
            <li 
              onClick={() => setActiveTab('projects')}
              className={`sidebar-item ${activeTab === 'projects' ? 'active' : ''} ${aiMode ? 'ai-active' : ''}`}
            >
              <PlusCircle size={18} /> Add Project
            </li>
          )}
          {aiMode && (
            <li 
              onClick={() => setActiveTab('insights')}
              className={`sidebar-item ${activeTab === 'insights' ? 'active' : ''} ${aiMode ? 'ai-active' : ''}`}
            >
              <Sparkles size={18} /> AI Workload Planner
            </li>
          )}
        </ul>

        {/* Selected Project Details Info panel */}
        {selectedProject && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Team Workspace</span>
              {(selectedProject.owner?._id === user._id || selectedProject.owner === user._id || user.role === 'admin') && (
                <button 
                  onClick={handleStartEditProjectName}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--secondary)',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '0 4px',
                    opacity: 0.8
                  }}
                  onMouseOver={(e) => e.target.style.opacity = 1}
                  onMouseOut={(e) => e.target.style.opacity = 0.8}
                >
                  Edit Name
                </button>
              )}
            </div>
            
            {isEditingProjectName ? (
              <form onSubmit={handleSaveProjectName} style={{ marginTop: '6px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={editingProjectNameValue}
                  onChange={(e) => setEditingProjectNameValue(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderColor: 'var(--secondary)'
                  }}
                  autoFocus
                  onBlur={() => setTimeout(() => setIsEditingProjectName(false), 200)}
                />
              </form>
            ) : (
              <h4 style={{ color: 'white', marginTop: '4px', fontSize: '0.95rem' }}>{selectedProject.name}</h4>
            )}
            <div style={{ marginTop: '12px', maxHeight: '120px', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Members ({selectedProject.members?.length || 0})</span>
              {selectedProject.members?.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.8rem' }}>
                  <div className="avatar-initials" style={{ width: '18px', height: '18px', fontSize: '0.55rem' }}>
                    {m.name[0]}
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                </div>
              ))}
            </div>

            {/* Invite Form (only for project owner/admins) */}
            {(selectedProject.owner._id === user._id || selectedProject.owner === user._id || user.role === 'admin') && (
              <form onSubmit={handleInviteMember} style={{ marginTop: '14px', display: 'flex', gap: '4px' }}>
                <input 
                  type="email" 
                  placeholder="Invite email..."
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '6px', borderRadius: '4px' }}>
                  <UserPlus size={14} />
                </button>
              </form>
            )}
          </div>
        )}

        <div className="sidebar-user">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar-initials">{user.name[0]}</div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{user.name.split(' ')[0]}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>{user.role}</p>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="main-content">
        <header className="header-row">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back, {user.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <h2 style={{ color: 'white', fontSize: '1.8rem' }}>{selectedProject ? selectedProject.name : 'Workspace Hub'}</h2>
              
              {/* Project select selector */}
              {projects.length > 0 && (
                <select 
                  value={selectedProject?._id || ''} 
                  onChange={(e) => setSelectedProject(projects.find(p => p._id === e.target.value))}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-header)',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {projects.map(p => (
                    <option key={p._id} value={p._id} style={{ background: '#0F172A' }}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="mode-toggle-container">
            <button 
              onClick={() => setAiMode(false)}
              className={`mode-toggle-btn ${!aiMode ? 'active normal' : ''}`}
            >
              <Zap size={14} /> Normal Mode
            </button>
            <button 
              onClick={() => setAiMode(true)}
              className={`mode-toggle-btn ${aiMode ? 'active ai' : ''}`}
            >
              <Bot size={14} /> AI Smart Mode
            </button>
          </div>
        </header>

        {/* Tab Selection Outputs */}
        {activeTab === 'board' && (
          <>
            {/* Natural Language AI Magic Input (only if in AI Mode) */}
            {aiMode && (
              <div className="nlp-container">
                <form onSubmit={handleNlpParse} className="nlp-search-bar">
                  <span style={{ display: 'flex', alignItems: 'center', paddingLeft: '14px', color: 'var(--secondary)' }}>
                    <Bot size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Type plain text commands to parse tasks (e.g. 'Build Auth APIs with high priority by Friday')..."
                    className="nlp-input"
                    value={nlpText}
                    onChange={(e) => setNlpText(e.target.value)}
                    disabled={nlpParsing}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-ai" 
                    style={{ padding: '8px 24px', borderRadius: '10px' }}
                    disabled={nlpParsing}
                  >
                    {nlpParsing ? <Loader className="animate-spin" size={16} /> : 'AI Magic Parse'}
                  </button>
                </form>
              </div>
            )}

            {/* Standard statistics row */}
            <div className="stats-row">
              <div className="glass-panel stat-widget">
                <span className="stat-label">Total Tasks</span>
                <p className="stat-val">{tasks.length}</p>
              </div>
              <div className="glass-panel stat-widget">
                <span className="stat-label">Todo Sprints</span>
                <p className="stat-val" style={{ color: 'var(--text-secondary)' }}>{todoTasks.length}</p>
              </div>
              <div className="glass-panel stat-widget">
                <span className="stat-label">In Progress</span>
                <p className="stat-val" style={{ color: 'var(--warning)' }}>{inProgressTasks.length}</p>
              </div>
              <div className="glass-panel stat-widget">
                <span className="stat-label">Completed</span>
                <p className="stat-val" style={{ color: 'var(--success)' }}>{completedTasks.length}</p>
              </div>
            </div>

            {/* Action Bar (Create Task Modal Trigger) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button 
                onClick={() => {
                  setFormAiMode(aiMode); // auto-match toggle
                  setShowTaskModal(true);
                }} 
                className={`btn ${aiMode ? 'btn-ai' : 'btn-primary'}`}
              >
                <Plus size={16} /> Create New Task
              </button>
            </div>

            {/* Dashboard Workspace Grid (Dashboard Split or full board depending on AI Mode toggle) */}
            <div className={aiMode ? 'dashboard-grid' : ''}>
              {/* Kanban columns */}
              <div className="kanban-grid" style={{ gridTemplateColumns: aiMode ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                
                {/* Traditional 3 columns layout if normal, stacked list details if AI */}
                {!aiMode ? (
                  <>
                    {/* Todo Column */}
                    <div className="kanban-column">
                      <div className="column-header">
                        <span>To Do</span>
                        <span className="column-count">{todoTasks.length}</span>
                      </div>
                      {todoTasks.map(task => renderTaskCard(task))}
                    </div>

                    {/* In Progress Column */}
                    <div className="kanban-column">
                      <div className="column-header">
                        <span>In Progress</span>
                        <span className="column-count">{inProgressTasks.length}</span>
                      </div>
                      {inProgressTasks.map(task => renderTaskCard(task))}
                    </div>

                    {/* Completed Column */}
                    <div className="kanban-column">
                      <div className="column-header">
                        <span>Completed</span>
                        <span className="column-count">{completedTasks.length}</span>
                      </div>
                      {completedTasks.map(task => renderTaskCard(task))}
                    </div>
                  </>
                ) : (
                  // Elegant Stacked listing for AI analysis focus
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ color: 'white', marginBottom: '4px' }}>Intelligent Task Scheduler View</h3>
                    {tasks.map(task => renderTaskCard(task))}
                  </div>
                )}
              </div>

              {/* Sidebar AI Insights panel (Visible in AI Mode) */}
              {aiMode && (
                <div className="insights-sidebar">
                  <div className="glass-panel score-widget ai-glow">
                    <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Project Health Score</h3>
                    {insightsLoading ? (
                      <div style={{ padding: '30px', textAlign: 'center' }}><Loader className="animate-spin" size={24} color="var(--secondary)" /></div>
                    ) : (
                      <>
                        <div className="score-circle">
                          <span className="score-num">{insights?.productivityScore || 80}</span>
                          <span className="score-lbl">Progression</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          Analyzed from active task loads, individual capacities, and deadline limits.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="glass-panel ai-glow" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={18} color="var(--warning)" /> Active Risk Flags
                    </h3>
                    {insightsLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center' }}><Loader size={18} /></div>
                    ) : (
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {insights?.riskAlerts?.map((alert, idx) => (
                          <li key={idx} style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                            <span style={{ color: 'var(--danger)' }}>⚡</span> {alert}
                          </li>
                        )) || <li>No active risk alerts generated. Ready to code!</li>}
                      </ul>
                    )}
                  </div>

                  <div className="glass-panel ai-glow" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'white', marginBottom: '14px' }}>Agile Recommendations</h3>
                    {insightsLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center' }}><Loader size={18} /></div>
                    ) : (
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {insights?.recommendedPlan?.map((plan, idx) => (
                          <li key={idx} style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: 'var(--secondary)' }}>•</span> {plan}
                          </li>
                        )) || <li>Create additional tasks to trigger suggestions.</li>}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Selection: AI Workload Planner Graphs */}
        {activeTab === 'insights' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>AI Workload & Capacity Balancing</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              Gemini evaluates active estimations across active developers to identify underallocated resources.
            </p>

            <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
              <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '24px' }}>Sprint Load Hours by User</h3>
              {workloadData.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Create tasks and assign them to team members to display workload analytics.</p>
              ) : (
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <BarChart data={workloadData}>
                      <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} />
                      <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0F172A', border: '1px solid var(--border)', borderRadius: '8px' }}
                        labelStyle={{ color: 'white', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Hours" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                        {workloadData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.Hours > 16 ? 'var(--danger)' : entry.Hours > 10 ? 'var(--warning)' : 'var(--primary)'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Selection: Project Creation (Admin Panel) */}
        {activeTab === 'projects' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '24px' }}>Create New Project scope</h2>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label className="form-label">Project Scope Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. E-Commerce Website Redesign"
                    className="form-input"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Description / Core Objective</label>
                  <textarea 
                    placeholder="Describe milestones, parameters, and deliverables..."
                    className="form-input"
                    rows={4}
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                  Initialize Project Scope
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ border: formAiMode ? '1px solid var(--secondary)' : '1px solid var(--border)' }}>
            <div className="modal-header">
              <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {formAiMode ? <Bot size={22} color="var(--secondary)" /> : <Zap size={22} color="var(--primary)" />}
                {formAiMode ? 'Create AI-Scheduled Task' : 'Create Manual Task'}
              </h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Implement dashboard analytics"
                  className="form-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select 
                  className="form-input"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  style={{ background: '#0F172A' }}
                >
                  <option value="">Unassigned</option>
                  {selectedProject?.members?.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-input"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    style={{ background: '#0F172A' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  placeholder="Provide milestones or outline instructions..."
                  className="form-input"
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Modal local AI mode toggler */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '24px'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white' }}>Enable AI Smart Scheduling</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gemini AI will automatically calculate estimated hours, priority, and generate checklists.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAiMode(!formAiMode)}
                  className={`btn ${formAiMode ? 'btn-ai' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px', fontSize: '0.8rem', minWidth: '100px' }}
                >
                  {formAiMode ? 'AI Mode ON' : 'Manual'}
                </button>
              </div>

              <button 
                type="submit" 
                className={`btn ${formAiMode ? 'btn-ai' : 'btn-primary'}`} 
                style={{ width: '100%', padding: '12px' }}
                disabled={creatingTask}
              >
                {creatingTask ? 'Processing...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NLP Task Parsing Preview Modal */}
      {showNlpPreview && parsedTaskData && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content ai-glow" style={{ border: '1px solid var(--secondary)' }}>
            <div className="modal-header">
              <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={22} color="var(--secondary)" /> AI Magic Task Parser Result
              </h3>
              <button 
                onClick={() => setShowNlpPreview(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div>
              <div style={{ marginBottom: '20px' }}>
                <span className="form-label">Extracted Title</span>
                <h4 style={{ color: 'white', fontSize: '1.2rem', marginTop: '4px' }}>{parsedTaskData.title}</h4>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span className="form-label">Generated Description</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px' }}>
                  {parsedTaskData.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>Suggested Priority</span>
                  <p style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize', marginTop: '2px' }}>{parsedTaskData.priority}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>Estimated Hours</span>
                  <p style={{ color: 'white', fontWeight: 'bold', marginTop: '2px' }}>{parsedTaskData.estimatedHours} Hours</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>Suggested Due Date</span>
                  <p style={{ color: 'white', fontWeight: 'bold', marginTop: '2px' }}>{formatDate(parsedTaskData.dueDate)}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>Risk Level</span>
                  <p style={{ color: parsedTaskData.riskLevel === 'High' ? 'var(--danger)' : 'white', fontWeight: 'bold', marginTop: '2px' }}>{parsedTaskData.riskLevel}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <span className="form-label" style={{ fontSize: '0.7rem' }}>Feasibility Score</span>
                  <p style={{ color: 'var(--success)', fontWeight: 'bold', marginTop: '2px' }}>{parsedTaskData.feasibilityScore}%</p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span className="form-label">AI Advice</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '6px' }}>
                  {parsedTaskData.aiRecommendation}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <span className="form-label">Subtask Breakdown Checklist</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  {parsedTaskData.generatedSubtasks?.map((sub, index) => (
                    <div key={index} style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '4px', fontSize: '0.82rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--secondary)' }}>✔</span> {sub.title}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowNlpPreview(false)} className="btn btn-secondary" style={{ flexGrow: 1 }}>
                  Cancel
                </button>
                <button 
                  onClick={handleSaveNlpTask} 
                  className="btn btn-ai" 
                  style={{ flexGrow: 2 }}
                  disabled={creatingTask}
                >
                  {creatingTask ? 'Saving...' : 'Accept and Save Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper renderer to render standard or AI-mode Task Cards
  function renderTaskCard(task) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    
    // Calculate subtask completions
    const totalSubtasks = task.generatedSubtasks?.length || 0;
    const completedSub = task.generatedSubtasks?.filter(s => s.completed).length || 0;
    const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSub / totalSubtasks) * 100) : 0;

    return (
      <div 
        key={task._id} 
        className={`glass-panel task-card ${task.aiMode ? 'ai-glow' : ''}`}
        style={{
          borderLeft: isOverdue ? '4px solid var(--danger)' : '',
        }}
      >
        {/* Priority tag indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`task-tag tag-${task.priority}`}>
            {task.priority}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Quick Action buttons */}
            <button 
              onClick={() => handleToggleTaskAi(task)} 
              title="Toggle AI Scheduler Mode"
              style={{ background: 'transparent', border: 'none', color: task.aiMode ? 'var(--secondary)' : 'var(--text-muted)', cursor: 'pointer' }}
            >
              <Bot size={16} />
            </button>
            <button 
              onClick={() => handleDeleteTask(task._id)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h4 className="task-title">{task.title}</h4>
        
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        {/* Quick status moves (Visible in AI listing or simple dropdown) */}
        {aiMode && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status:</span>
            <select 
              value={task.status} 
              onChange={(e) => handleStatusChange(task._id, e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'white',
                border: '1px solid var(--border)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="todo" style={{ background: '#0F172A' }}>Todo</option>
              <option value="in_progress" style={{ background: '#0F172A' }}>In Progress</option>
              <option value="completed" style={{ background: '#0F172A' }}>Completed</option>
            </select>
          </div>
        )}

        {/* Render checklists for AI subtasks if active */}
        {task.aiMode && totalSubtasks > 0 && (
          <div style={{ margin: '14px 0 10px 0', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--secondary)' }}>AI Subtask Breakdown</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completedSub}/{totalSubtasks} ({subtaskPercent}%)</span>
            </div>
            
            {/* Progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ width: `${subtaskPercent}%`, height: '100%', background: 'var(--secondary)' }} />
            </div>

            <div className="subtasks-list">
              {task.generatedSubtasks.map(sub => (
                <div 
                  key={sub._id} 
                  onClick={() => handleToggleSubtask(task, sub._id)}
                  className={`subtask-item ${sub.completed ? 'completed' : ''}`}
                >
                  <div className="subtask-checkbox">
                    {sub.completed && '✓'}
                  </div>
                  <span>{sub.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Render AI Scheduler Badges if AI mode ON */}
        {task.aiMode && (
          <div className="ai-badge-row">
            <span className="ai-pill">⏳ {task.estimatedHours || 8} Hrs</span>
            <span className={`ai-pill ${task.riskLevel === 'High' ? 'risk-high' : ''}`}>⚡ Risk: {task.riskLevel || 'Low'}</span>
            <span className="ai-pill">🎯 Fit: {task.feasibilityScore || 90}%</span>
          </div>
        )}

        {task.aiRecommendation && task.aiMode && (
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            background: 'rgba(139, 92, 246, 0.03)', 
            border: '1px solid rgba(139, 92, 246, 0.1)', 
            padding: '8px 12px', 
            borderRadius: '6px',
            marginTop: '10px'
          }}>
            💡 <strong>AI Recommendation:</strong> {task.aiRecommendation}
          </p>
        )}

        <div className="task-footer">
          <div className="task-assignee">
            {task.assignedTo ? (
              <>
                <div className="avatar-initials" style={{ width: '18px', height: '18px', fontSize: '0.55rem' }}>
                  {task.assignedTo.name[0]}
                </div>
                <span>{task.assignedTo.name.split(' ')[0]}</span>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            <span style={{ color: isOverdue ? 'var(--danger)' : 'inherit' }}>{formatDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
    );
  }
};

export default Dashboard;
