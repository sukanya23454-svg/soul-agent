-- Add marketplace fields to agents table
ALTER TABLE public.agents 
ADD COLUMN is_public boolean DEFAULT false,
ADD COLUMN published_at timestamp with time zone,
ADD COLUMN clone_count integer DEFAULT 0,
ADD COLUMN rating_average numeric(3,2) DEFAULT 0,
ADD COLUMN rating_count integer DEFAULT 0,
ADD COLUMN original_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL;

-- Create agent_ratings table
CREATE TABLE public.agent_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Enable RLS on agent_ratings
ALTER TABLE public.agent_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_ratings
CREATE POLICY "Anyone can view ratings"
ON public.agent_ratings FOR SELECT
USING (true);

CREATE POLICY "Users can create ratings"
ON public.agent_ratings FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.agent_ratings FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.agent_ratings FOR DELETE
USING (auth.uid()::text = user_id);

-- Update agents RLS to allow viewing public agents
DROP POLICY IF EXISTS "Users can view their own agents" ON public.agents;

CREATE POLICY "Users can view their own agents"
ON public.agents FOR SELECT
USING (auth.uid()::text = user_id OR is_public = true);

-- Function to update agent rating stats
CREATE OR REPLACE FUNCTION update_agent_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.agents
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.agent_ratings
      WHERE agent_id = NEW.agent_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.agent_ratings
      WHERE agent_id = NEW.agent_id
    )
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating stats
CREATE TRIGGER update_rating_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.agent_ratings
FOR EACH ROW
EXECUTE FUNCTION update_agent_rating_stats();

-- Index for public agents
CREATE INDEX idx_agents_public ON public.agents(is_public, published_at DESC) WHERE is_public = true;
CREATE INDEX idx_agent_ratings_agent_id ON public.agent_ratings(agent_id);