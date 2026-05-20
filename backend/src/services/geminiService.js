const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

// Helper to safely parse JSON from Gemini's output
const parseJsonResponse = (text) => {
  let cleanText = text.trim();
  
  // Extract JSON if it is wrapped in markdown code blocks
  if (cleanText.includes('```json')) {
    cleanText = cleanText.split('```json')[1].split('```')[0];
  } else if (cleanText.includes('```')) {
    cleanText = cleanText.split('```')[1].split('```')[0];
  }
  
  cleanText = cleanText.trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON. Raw response was:', text);
    throw new Error('AI response parsing failed. Please try again.');
  }
};

// Check if API Key is a mock
const isApiKeyMock = () => {
  const key = process.env.GEMINI_API_KEY;
  return !key || key === 'your_gemini_api_key_here' || key === 'MOCK_KEY';
};

/**
 * 1. AI Task Description Generator
 * Takes a short title and expands it into a professional, clear description.
 */
exports.generateDescription = async (title) => {
  if (isApiKeyMock()) {
    return `Develop a robust and scalable implementation for "${title}" including proper unit tests, comprehensive error handling, and API documentation.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert product manager and technical writer.
      Generate a professional, concise, and highly detailed software development task description for a task titled: "${title}".
      
      Requirements:
      - Detail what needs to be built.
      - List technical considerations (e.g. performance, security, edge cases).
      - Keep it under 100 words.
      - Return ONLY the raw description text. Do not add titles, bullet points, or markdown blocks unless necessary.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini Generate Description Error:', error);
    return `Implement and verify the functional modules for: ${title}.`;
  }
};

/**
 * 2. AI Subtask Generator
 * Generates an array of small, actionable checklists.
 */
exports.generateSubtasks = async (title, description = '') => {
  if (isApiKeyMock()) {
    return [
      { title: 'Setup local workspace and verify specifications', completed: false },
      { title: 'Define API contracts / Database schema structures', completed: false },
      { title: 'Code logic for core functionalities', completed: false },
      { title: 'Write tests and handle standard edge cases', completed: false },
      { title: 'Conduct peer review and deploy', completed: false }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert software architect.
      Break down the following task into a list of 4 to 6 small, actionable, sequential subtasks (checklists).
      
      Task Title: "${title}"
      Task Description: "${description}"
      
      Return ONLY a valid JSON array of strings containing the subtask titles.
      Format exactly like this:
      ["Step 1: Do X", "Step 2: Do Y", "Step 3: Do Z"]
      
      Return only JSON, no formatting, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const parsedSubtaskTitles = parseJsonResponse(rawText);
    
    return parsedSubtaskTitles.map(title => ({
      title: title.toString(),
      completed: false
    }));
  } catch (error) {
    console.error('Gemini Subtask Generator Error:', error);
    return [
      { title: 'Analyze requirements and outline dependencies', completed: false },
      { title: 'Develop core functional logic', completed: false },
      { title: 'Implement security & validation criteria', completed: false },
      { title: 'Verify modules and complete checklist', completed: false }
    ];
  }
};

/**
 * 3. AI Smart Scheduler & Feasibility Analyzer
 * Evaluates completion times, priority, realistic deadlines, risk levels, and suggestions.
 */
exports.analyzeAndScheduleTask = async (taskData, existingTasks = []) => {
  const { title, description = '', dueDate } = taskData;
  
  if (isApiKeyMock()) {
    const defaultHours = title.toLowerCase().includes('auth') ? 12 : 8;
    return {
      priority: title.toLowerCase().includes('bug') ? 'high' : 'medium',
      estimatedHours: defaultHours,
      riskLevel: 'Medium',
      feasibilityScore: 85,
      aiRecommendation: 'This task seems feasible. Allocate 1-2 days to set up routing and schemas, then integrate backend logic.',
      suggestedSubtasks: [
        { title: 'Configure dependencies & environment', completed: false },
        { title: 'Build database schemas & relationships', completed: false },
        { title: 'Develop core routing APIs', completed: false },
        { title: 'Integrate testing assertions', completed: false }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const formattedExisting = existingTasks.map(t => `- Title: ${t.title}, Priority: ${t.priority}, Hours: ${t.estimatedHours || 'N/A'}, Status: ${t.status}`).join('\n');
    
    const prompt = `
      You are an AI-powered project scheduler and workload balancer.
      Analyze the following new task and suggest optimal parameters and scheduling feasibility given current workload.
      
      New Task:
      - Title: "${title}"
      - Description: "${description}"
      - Target Due Date: "${dueDate ? new Date(dueDate).toDateString() : 'None provided'}"
      
      Current Team Workload (Active Tasks):
      ${formattedExisting || 'No active tasks assigned yet.'}
      
      You must evaluate and output a valid JSON object matching the schema below.
      Your recommendations must account for target due dates. If a target due date is too aggressive (e.g. 1 day for a complex system), flag it as high risk and adjust the feasibility score accordingly.
      
      Expected JSON Output Schema:
      {
        "priority": "low" | "medium" | "high",
        "estimatedHours": number (integer estimate of task duration),
        "riskLevel": "Low" | "Medium" | "High",
        "feasibilityScore": number (integer between 0 and 100 representing realistic deadline feasibility),
        "aiRecommendation": "string explaining reasoning, feasibility, and order of execution adjustments",
        "suggestedSubtasks": ["string", "string", ...]
      }
      
      Return ONLY the raw JSON object, no markdown wrappers, no introductory comments.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const insights = parseJsonResponse(rawText);
    
    // Map suggestedSubtasks into the structured format [{ title, completed }]
    const structuredSubtasks = (insights.suggestedSubtasks || []).map(title => ({
      title: title.toString(),
      completed: false
    }));

    return {
      priority: ['low', 'medium', 'high'].includes(insights.priority?.toLowerCase()) ? insights.priority.toLowerCase() : 'medium',
      estimatedHours: Number(insights.estimatedHours) || 8,
      riskLevel: ['Low', 'Medium', 'High'].includes(insights.riskLevel) ? insights.riskLevel : 'Medium',
      feasibilityScore: Number(insights.feasibilityScore) || 80,
      aiRecommendation: insights.aiRecommendation || 'Task scheduled successfully.',
      suggestedSubtasks: structuredSubtasks
    };
  } catch (error) {
    console.error('Gemini Analyze Task Error:', error);
    return {
      priority: 'medium',
      estimatedHours: 8,
      riskLevel: 'Low',
      feasibilityScore: 90,
      aiRecommendation: 'Completed basic task analysis. Looks feasible under ordinary operating schedules.',
      suggestedSubtasks: [
        { title: 'Initialize coding structure', completed: false },
        { title: 'Complete business rules writing', completed: false },
        { title: 'Verify deployment targets', completed: false }
      ]
    };
  }
};

/**
 * 4. Natural Language Task Creation Parser
 * Converts a text like "Setup payment auth endpoint by next Friday with priority High"
 * into a structured object containing title, dueDate, priority, subtasks, etc.
 */
exports.parseNaturalLanguageTask = async (text) => {
  if (isApiKeyMock()) {
    // Generate a crude mock parse based on keywords
    const lower = text.toLowerCase();
    let priority = 'medium';
    if (lower.includes('high') || lower.includes('urgent') || lower.includes('asap')) priority = 'high';
    if (lower.includes('low') || lower.includes('trivial')) priority = 'low';

    // Crude date parsing
    let dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 days from now default

    return {
      title: text.length > 50 ? text.substring(0, 47) + '...' : text,
      description: `Task created via Natural Language input: "${text}"`,
      priority,
      dueDate,
      estimatedHours: 6,
      aiMode: true,
      riskLevel: 'Low',
      feasibilityScore: 95,
      aiRecommendation: 'Analyzed natural language request. Simple workflow predicted.',
      generatedSubtasks: [
        { title: 'Setup workspace variables', completed: false },
        { title: 'Develop logic requirements', completed: false },
        { title: 'Verify correctness and completeness', completed: false }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a smart natural language processing assistant for project managers.
      Parse the following user request and convert it into a structured task parameter JSON block.
      
      User Request: "${text}"
      Current Time: "${new Date().toISOString()}"
      
      You must output a valid JSON object matching the schema below. Break down the implied work into suggested subtasks and estimated hours.
      
      Expected JSON Output Schema:
      {
        "title": "string (summarized clean task title)",
        "description": "string (fleshed out explanation of the request)",
        "priority": "low" | "medium" | "high",
        "dueDate": "ISO Date string (estimate based on words like 'Friday', 'next week', 'tomorrow', 'end of month')",
        "estimatedHours": number (integer estimate of task duration),
        "riskLevel": "Low" | "Medium" | "High",
        "feasibilityScore": number (integer between 0 and 100),
        "aiRecommendation": "string (summary advice)",
        "suggestedSubtasks": ["string", "string", ...]
      }
      
      Return ONLY the raw JSON object, no markdown wrappers, no introductory comments.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const parsed = parseJsonResponse(rawText);
    
    const structuredSubtasks = (parsed.suggestedSubtasks || []).map(title => ({
      title: title.toString(),
      completed: false
    }));

    return {
      title: parsed.title || text,
      description: parsed.description || `Parsed natural language request: "${text}"`,
      priority: ['low', 'medium', 'high'].includes(parsed.priority?.toLowerCase()) ? parsed.priority.toLowerCase() : 'medium',
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
      estimatedHours: Number(parsed.estimatedHours) || 8,
      riskLevel: ['Low', 'Medium', 'High'].includes(parsed.riskLevel) ? parsed.riskLevel : 'Low',
      feasibilityScore: Number(parsed.feasibilityScore) || 90,
      aiRecommendation: parsed.aiRecommendation || 'Successfully parsed natural language intent.',
      generatedSubtasks: structuredSubtasks,
      aiMode: true
    };
  } catch (error) {
    console.error('Gemini Parse Natural Language Error:', error);
    // Return standard fallback
    return {
      title: text,
      description: `Task created via natural language: "${text}"`,
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
      estimatedHours: 8,
      riskLevel: 'Low',
      feasibilityScore: 90,
      aiRecommendation: 'Fallback parsing used due to service limitation.',
      generatedSubtasks: [
        { title: 'Initialize functional module', completed: false },
        { title: 'Implement functional logic', completed: false },
        { title: 'Conduct local verification checks', completed: false }
      ],
      aiMode: true
    };
  }
};

/**
 * 5. AI Productivity Assistant & Workload Balancing Insights
 * Generates overall comments on active project status, bottlenecks, and optimizations.
 */
exports.generateProductivityInsights = async (projectTasks, projectMembers = []) => {
  if (isApiKeyMock()) {
    return {
      productivityScore: 78,
      insights: [
        'Excellent! Total task load is balanced across active users.',
        'High-priority assignments should be addressed before testing cycles begin.',
        'Consider splitting multi-day milestones into smaller subtask chunks.'
      ],
      riskAlerts: [
        '1 task is nearing its deadline and remains in "Todo" status.'
      ],
      recommendedPlan: [
        'Complete high-priority setup APIs first.',
        'Delay deployment testing items by 1 day to assure review coverage.'
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const formattedTasks = projectTasks.map(t => {
      const assigneeName = t.assignedTo ? (t.assignedTo.name || t.assignedTo) : 'Unassigned';
      return `- Title: "${t.title}", Status: "${t.status}", Assigned To: "${assigneeName}", Hours: ${t.estimatedHours || 'N/A'}, Due: ${t.dueDate ? new Date(t.dueDate).toDateString() : 'None'}`;
    }).join('\n');

    const formattedMembers = projectMembers.map(m => `- ${m.name} (${m.role})`).join('\n');

    const prompt = `
      You are an expert agile coach and productivity optimizer.
      Analyze the current status of the software development team and project tasks, then generate action-oriented productivity metrics and recommendations.
      
      Project Members:
      ${formattedMembers || 'No listed team members.'}
      
      Active Project Tasks:
      ${formattedTasks || 'No tasks created in this project yet.'}
      
      Analyze:
      1. Overall workload distribution (overloaded members vs idle members).
      2. Priority conflicts (too many high priority tasks).
      3. Project risk (overdue tasks, unassigned critical tasks).
      
      Output a valid JSON object matching the schema below.
      
      Expected JSON Output Schema:
      {
        "productivityScore": number (integer between 0 and 100 reflecting standard progression health),
        "insights": ["string", "string", ... (bullet insights on performance bottlenecks)],
        "riskAlerts": ["string", ... (specific warnings, e.g., 'Alice has 24 hours of work scheduled this week')],
        "recommendedPlan": ["string", ... (step-by-step optimization adjustments for the team to focus on today)]
      }
      
      Return ONLY the raw JSON object, no markdown wrappers, no introductory comments.
    `;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    return parseJsonResponse(rawText);
  } catch (error) {
    console.error('Gemini Insights Error:', error);
    return {
      productivityScore: 80,
      insights: ['Standard workload detected.', 'Review deadlines on upcoming high-priority tickets.'],
      riskAlerts: ['Verify unassigned task items.'],
      recommendedPlan: ['Complete outstanding developer sprints in order of creation dates.']
    };
  }
};
