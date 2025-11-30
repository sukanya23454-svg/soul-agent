-- Fix messages table: Add CHECK constraint for role
-- Drop existing constraint if any
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_role_check;

-- Add proper CHECK constraint for role
ALTER TABLE public.messages 
ADD CONSTRAINT messages_role_check 
CHECK (role IN ('user', 'agent'));

-- Ensure content is NOT NULL
ALTER TABLE public.messages 
ALTER COLUMN content SET NOT NULL;

-- Ensure agent_id is NOT NULL
ALTER TABLE public.messages 
ALTER COLUMN agent_id SET NOT NULL;

-- Fix agents table: Ensure required columns are NOT NULL
ALTER TABLE public.agents 
ALTER COLUMN name SET NOT NULL;

-- Add index for faster message queries
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON public.messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);