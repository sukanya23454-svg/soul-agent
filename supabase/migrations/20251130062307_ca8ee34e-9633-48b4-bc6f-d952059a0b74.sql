-- Create abilities table (predefined skills agents can have)
CREATE TABLE public.abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'productivity', 'creativity', 'learning', 'health', 'automation'
  prompt_template TEXT NOT NULL, -- Template for how to use this ability in AI prompts
  icon TEXT, -- Lucide icon name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent_abilities junction table (many-to-many)
CREATE TABLE public.agent_abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  ability_id UUID NOT NULL REFERENCES public.abilities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agent_id, ability_id)
);

-- Create agent_memories table for long-term memory
CREATE TABLE public.agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'preference', 'context', 'summary')),
  content TEXT NOT NULL,
  importance SMALLINT DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for abilities (public read, admin write)
CREATE POLICY "Anyone can view abilities"
  ON public.abilities FOR SELECT
  USING (true);

-- RLS Policies for agent_abilities
CREATE POLICY "Users can view abilities of their agents"
  ON public.agent_abilities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_abilities.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

CREATE POLICY "Users can add abilities to their agents"
  ON public.agent_abilities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_abilities.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

CREATE POLICY "Users can remove abilities from their agents"
  ON public.agent_abilities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_abilities.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

-- RLS Policies for agent_memories
CREATE POLICY "Users can view memories of their agents"
  ON public.agent_memories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memories.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

CREATE POLICY "Users can create memories for their agents"
  ON public.agent_memories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memories.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

CREATE POLICY "Users can update memories of their agents"
  ON public.agent_memories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memories.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

CREATE POLICY "Users can delete memories of their agents"
  ON public.agent_memories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memories.agent_id
      AND agents.user_id = (auth.uid())::text
    )
  );

-- Add indexes for performance
CREATE INDEX idx_agent_abilities_agent_id ON public.agent_abilities(agent_id);
CREATE INDEX idx_agent_abilities_ability_id ON public.agent_abilities(ability_id);
CREATE INDEX idx_agent_memories_agent_id ON public.agent_memories(agent_id);
CREATE INDEX idx_agent_memories_importance ON public.agent_memories(importance DESC);
CREATE INDEX idx_agent_memories_last_accessed ON public.agent_memories(last_accessed DESC);

-- Insert predefined abilities
INSERT INTO public.abilities (name, description, category, prompt_template, icon) VALUES
  ('Summarize Text', 'Condense long text into key points and main ideas', 'productivity', 'When asked to summarize, extract the main points, key takeaways, and essential information in a clear, concise format.', 'FileText'),
  ('Explain Simply', 'Break down complex topics into simple, easy-to-understand explanations', 'learning', 'When explaining concepts, use simple language, analogies, and step-by-step breakdowns. Make it easy for anyone to understand.', 'Lightbulb'),
  ('Generate Content', 'Create tweets, captions, blog posts, and social media content', 'creativity', 'When generating content, be creative, engaging, and adapt tone to the platform. Make it compelling and shareable.', 'Sparkles'),
  ('Plan Tasks', 'Break down goals into actionable tasks and create schedules', 'productivity', 'When planning, create clear, actionable steps with priorities. Break large goals into manageable tasks.', 'ListChecks'),
  ('Research Helper', 'Analyze information, find insights, and answer research questions', 'learning', 'When researching, be thorough, cite key information, provide multiple perspectives, and summarize findings clearly.', 'Search'),
  ('Motivation Messages', 'Provide encouragement, positive affirmations, and motivational support', 'health', 'When motivating, be uplifting, encouraging, and personalized. Focus on progress and positive reinforcement.', 'Heart'),
  ('Workout Generator', 'Create personalized fitness routines and exercise plans', 'health', 'When creating workouts, consider fitness level, goals, and available equipment. Provide clear instructions and safety tips.', 'Dumbbell'),
  ('Idea Generator', 'Brainstorm creative ideas and innovative solutions', 'creativity', 'When brainstorming, think outside the box, provide diverse options, and encourage creative thinking.', 'Zap'),
  ('Note Taking', 'Organize thoughts, create structured notes, and maintain information', 'productivity', 'When taking notes, structure information clearly with headers, bullet points, and key highlights. Make it easy to reference later.', 'StickyNote'),
  ('Daily Planning', 'Create daily schedules, prioritize tasks, and manage time effectively', 'productivity', 'When planning daily tasks, prioritize based on importance and deadlines. Create realistic, balanced schedules.', 'Calendar'),
  ('Habit Tracker', 'Monitor habits, track progress, and provide accountability', 'health', 'When tracking habits, celebrate progress, identify patterns, and provide constructive feedback for improvement.', 'Target'),
  ('Reasoning Helper', 'Guide through logical thinking and problem-solving processes', 'learning', 'When helping with reasoning, break down problems step-by-step, identify assumptions, and guide through logical conclusions.', 'Brain');