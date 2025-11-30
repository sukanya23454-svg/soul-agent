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

export interface AgentAutomation {
  id: string;
  agent_id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: string;
  time_of_day: string | null;
  action_type: 'send_message' | 'summarize_chat' | 'reminder' | 'auto_save_notes';
  action_config: Record<string, any>;
  is_active: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
}

export interface AgentFile {
  id: string;
  agent_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis_summary: string | null;
  created_at: string;
}
