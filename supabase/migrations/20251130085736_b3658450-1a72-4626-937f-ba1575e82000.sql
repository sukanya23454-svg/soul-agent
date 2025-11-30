-- Create storage bucket for agent files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-files',
  'agent-files',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create agent_files table to track uploaded files
CREATE TABLE agent_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  analysis_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on agent_files
ALTER TABLE agent_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_files
CREATE POLICY "Users can view their agent files"
  ON agent_files FOR SELECT
  USING (user_id = (auth.uid())::text);

CREATE POLICY "Users can upload files for their agents"
  ON agent_files FOR INSERT
  WITH CHECK (
    user_id = (auth.uid())::text
    AND EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = agent_files.agent_id 
      AND agents.user_id = (auth.uid())::text
    )
  );

CREATE POLICY "Users can delete their agent files"
  ON agent_files FOR DELETE
  USING (user_id = (auth.uid())::text);

-- Storage policies for agent-files bucket
CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'agent-files'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'agent-files'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'agent-files'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Create index for faster queries
CREATE INDEX idx_agent_files_agent_id ON agent_files(agent_id);
CREATE INDEX idx_agent_files_user_id ON agent_files(user_id);
CREATE INDEX idx_agent_files_created_at ON agent_files(created_at DESC);