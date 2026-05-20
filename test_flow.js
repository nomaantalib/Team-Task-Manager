// Using native global fetch in Node v22

async function test() {
  const API_URL = 'http://localhost:5000/api';

  console.log('1. Registering/Logging in test user...');
  let loginRes;
  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin'
      })
    });
    const regData = await regRes.json();
    console.log('Register response:', regData);
  } catch (e) {
    console.log('User might already exist, attempting login...');
  }

  const logRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
  const logData = await logRes.json();
  console.log('Login response:', logData);

  if (!logData.success) {
    console.error('Login failed!');
    return;
  }

  const token = logData.token;

  console.log('\n2. Creating a project...');
  const projRes = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Test Project',
      description: 'A test project'
    })
  });
  const projData = await projRes.json();
  console.log('Project response:', projData);

  if (!projData.success) {
    console.error('Project creation failed!');
    return;
  }

  const projectId = projData.project._id;

  console.log('\n3. Parsing natural language input...');
  const parseRes = await fetch(`${API_URL}/ai/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: 'Build payment auth API with high priority by next Friday'
    })
  });
  const parseData = await parseRes.json();
  console.log('Parse response:', JSON.stringify(parseData, null, 2));

  if (!parseData.success) {
    console.error('NLP Parse failed!');
    return;
  }

  console.log('\n4. Attempting to save the parsed task...');
  const taskRes = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: parseData.data.title,
      description: parseData.data.description,
      project: projectId,
      dueDate: parseData.data.dueDate,
      priority: parseData.data.priority,
      aiMode: true,
      estimatedHours: parseData.data.estimatedHours,
      riskLevel: parseData.data.riskLevel,
      feasibilityScore: parseData.data.feasibilityScore,
      aiRecommendation: parseData.data.aiRecommendation,
      generatedSubtasks: parseData.data.generatedSubtasks
    })
  });
  const taskData = await taskRes.json();
  console.log('Task save response:', taskData);
}

test().catch(console.error);
