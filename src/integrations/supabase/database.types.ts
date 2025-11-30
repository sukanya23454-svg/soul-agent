export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string;
  personality: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  agent_id: string;
  role: 'user' | 'agent';
  content: string;
  created_at: string;
}
