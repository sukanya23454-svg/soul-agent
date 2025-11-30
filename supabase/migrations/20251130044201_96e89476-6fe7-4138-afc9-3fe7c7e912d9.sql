-- Enable RLS on agents table
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "Users can view their own agents"
  ON public.agents FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own agents"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages from their agents"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = messages.agent_id
      AND agents.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create messages for their agents"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = messages.agent_id
      AND agents.user_id = auth.uid()::text
    )
  );