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

export interface Ability {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt_template: string;
  icon: string | null;
  created_at: string;
}

export interface AgentAbility {
  id: string;
  agent_id: string;
  ability_id: string;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  agent_id: string;
  memory_type: 'fact' | 'preference' | 'context' | 'summary';
  content: string;
  importance: number;
  created_at: string;
  last_accessed: string;
}
