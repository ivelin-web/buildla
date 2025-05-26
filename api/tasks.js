// Available tasks configuration
const TASKS = {
  bathroom: {
    id: 'bathroom',
    name: 'Badrumsrenovering',
    description: 'Få prisförslag för din badrumsrenovering'
  }
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const taskList = Object.values(TASKS);
    return res.status(200).json({ tasks: taskList });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
} 